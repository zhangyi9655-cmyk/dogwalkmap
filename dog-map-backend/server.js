const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

const JWT_SECRET = process.env.JWT_SECRET || 'dogmap_secret_key_2024';
const DATA_FILE = path.join(__dirname, 'data.json');

// 简单的JSON文件存储
let data = {
  users: [],
  places: [],
  ratings: []
};

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.log('Loading default data');
  }
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

loadData();

// 创建默认管理员账户
async function initAdmin() {
  const adminExists = data.users.find(u => u.role === 'admin');
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    data.users.push({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    saveData();
    console.log('Admin account created: admin / admin123');
  }
}
initAdmin();

// 中间件 - 验证token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未登录' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: '无效的token' });
  }
}

// 中间件 - 验证管理员
function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
}

// ==================== 认证接口 ====================

// 注册
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, phone } = req.body;
    if (!username || !password) return res.status(400).json({ error: '请填写用户名和密码' });
    
    if (data.users.find(u => u.username === username)) {
      return res.status(400).json({ error: '用户名已存在' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      phone,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    data.users.push(user);
    saveData();
    
    res.json({ message: '注册成功', user: { id: user.id, username: user.username, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = data.users.find(u => u.username === username);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: '用户名或密码错误' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (e) {
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户
app.get('/api/me', authMiddleware, (req, res) => {
  const user = data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json({ id: user.id, username: user.username, role: user.role });
});

// ==================== 地点接口 ====================

// 获取所有已审核通过的地点
app.get('/api/places', (req, res) => {
  const approved = data.places.filter(p => p.status === 'approved');
  res.json(approved);
});

// 获取所有地点（管理员）
app.get('/api/admin/places', authMiddleware, adminMiddleware, (req, res) => {
  res.json(data.places);
});

// 提交地点（先评分）
app.post('/api/places', authMiddleware, (req, res) => {
  const { name, region, address, type, ratings, details } = req.body;
  
  if (!name || !region || !address || !type || !ratings) {
    return res.status(400).json({ error: '请填写必要信息' });
  }
  
  const place = {
    id: Date.now().toString(),
    name,
    region,
    address,
    type,
    ratings,
    details: details || {},
    status: 'pending',
    submittedBy: req.user.username,
    submittedAt: new Date().toISOString()
  };
  
  data.places.push(place);
  saveData();
  
  res.json({ message: '提交成功，等待审核', place });
});

// 更新地点详情（评分后）
app.put('/api/places/:id', authMiddleware, (req, res) => {
  const { details } = req.body;
  const place = data.places.find(p => p.id === req.params.id);
  
  if (!place) return res.status(404).json({ error: '地点不存在' });
  if (place.submittedBy !== req.user.username && req.user.role !== 'admin') {
    return res.status(403).json({ error: '无权修改' });
  }
  
  place.details = details;
  saveData();
  
  res.json({ message: '更新成功', place });
});

// 审核地点（管理员）
app.put('/api/admin/places/:id/approve', authMiddleware, adminMiddleware, (req, res) => {
  const place = data.places.find(p => p.id === req.params.id);
  if (!place) return res.status(404).json({ error: '地点不存在' });
  
  place.status = 'approved';
  saveData();
  
  res.json({ message: '审核通过', place });
});

app.put('/api/admin/places/:id/reject', authMiddleware, adminMiddleware, (req, res) => {
  const place = data.places.find(p => p.id === req.params.id);
  if (!place) return res.status(404).json({ error: '地点不存在' });
  
  place.status = 'rejected';
  saveData();
  
  res.json({ message: '已拒绝', place });
});

// 删除地点（管理员）
app.delete('/api/admin/places/:id', authMiddleware, adminMiddleware, (req, res) => {
  const index = data.places.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: '地点不存在' });
  
  data.places.splice(index, 1);
  saveData();
  
  res.json({ message: '删除成功' });
});

// ==================== 启动服务器 ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
});
