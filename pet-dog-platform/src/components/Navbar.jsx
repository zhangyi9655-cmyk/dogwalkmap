import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Dog, Plus, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react';

const API_BASE = '';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || '操作失败');
        return;
      }
      
      if (authMode === 'login') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setShowAuth(false);
      } else {
        setAuthMode('login');
        setError('注册成功，请登录');
      }
    } catch (err) {
      setError('网络错误');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Dog className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">北京遛狗地图</span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {user.username}
                  </span>
                  <Link 
                    to="/submit" 
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    发布地点
                  </Link>
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    管理后台
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    退出
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowAuth(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <LogIn className="w-4 h-4" />
                  登录/注册
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">{authMode === 'login' ? '登录' : '注册'}</h2>
            <form onSubmit={handleAuth}>
              <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-3"
                required
              />
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-3"
                required
              />
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <button 
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {authMode === 'login' ? '登录' : '注册'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              {authMode === 'login' ? '没有账号？' : '已有账号？'}
              <button 
                onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-blue-600 ml-1"
              >
                {authMode === 'login' ? '注册' : '登录'}
              </button>
            </p>
            <button 
              onClick={() => setShowAuth(false)}
              className="mt-4 w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}
