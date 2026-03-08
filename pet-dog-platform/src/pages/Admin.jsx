import { useState, useEffect } from 'react';
import { getPlaces, savePlaces, calculateRating } from '../data/places';
import { 
  MapPin, Star, Edit, Trash2, Check, X, Eye, EyeOff, Plus, 
  Search, Filter, Download, BarChart3, Settings, Trash, CheckCircle,
  AlertTriangle, Clock, TrendingUp, Users, FileText, Package
} from 'lucide-react';

// 拒绝原因选项
const rejectReasons = [
  { value: 'invalid', label: '信息无效或不准确' },
  { value: 'inappropriate', label: '内容不当' },
  { value: 'advertisement', label: '广告内容' },
  { value: 'duplicate', label: '重复提交' },
  { value: 'other', label: '其他原因' },
];

export default function Admin() {
  const [places, setPlaces] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [editingPlace, setEditingPlace] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectCustom, setRejectCustom] = useState('');
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState('all');

  useEffect(() => {
    getPlaces().then(data => setPlaces(data));
  }, []);

  const pendingPlaces = places.filter(p => p.status === 'pending');
  const approvedPlaces = places.filter(p => p.status === 'approved');
  const rejectedPlaces = places.filter(p => p.status === 'rejected');
  const hiddenPlaces = places.filter(p => p.status === 'hidden');

  const currentList = activeTab === 'pending' ? pendingPlaces 
    : activeTab === 'approved' ? approvedPlaces 
    : activeTab === 'rejected' ? rejectedPlaces 
    : places;

  const filteredList = currentList.filter(p => 
    p.name.includes(search) || 
    p.address.includes(search) ||
    p.region.includes(search)
  );

  // 统计计算
  const getStats = () => {
    const approved = places.filter(p => p.status === 'approved');
    const totalRatings = approved.reduce((sum, p) => sum + (p.ratingCount || 0), 0);
    const avgRating = approved.length > 0 
      ? (approved.reduce((sum, p) => sum + parseFloat(calculateRating(p.ratings || p.rating)), 0) / approved.length).toFixed(1)
      : 0;
    
    // 评分分布
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    approved.forEach(p => {
      const r = Math.round(parseFloat(calculateRating(p.ratings || p.rating)));
      if (r >= 1 && r <= 5) ratingDistribution[r]++;
    });

    // 区域分布
    const regionStats = {};
    approved.forEach(p => {
      regionStats[p.region] = (regionStats[p.region] || 0) + 1;
    });

    // 类型分布
    const typeStats = {};
    approved.forEach(p => {
      typeStats[p.type] = (typeStats[p.type] || 0) + 1;
    });

    return { totalRatings, avgRating, ratingDistribution, regionStats, typeStats, approved: approved.length };
  };

  const stats = getStats();

  const handleApprove = (id) => {
    const updated = places.map(p => p.id === id ? { ...p, status: 'approved' } : p);
    savePlaces(updated);
    setPlaces(updated);
  };

  const handleBatchApprove = () => {
    const updated = places.map(p => 
      selectedItems.includes(p.id) ? { ...p, status: 'approved' } : p
    );
    savePlaces(updated);
    setPlaces(updated);
    setSelectedItems([]);
  };

  const handleReject = (id) => {
    setRejectTargetId(id);
    setRejectReason('');
    setRejectCustom('');
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    const reason = rejectReason === 'other' ? rejectCustom : rejectReasons.find(r => r.value === rejectReason)?.label || '未说明原因';
    const updated = places.map(p => 
      p.id === rejectTargetId ? { ...p, status: 'rejected', rejectReason: reason } : p
    );
    savePlaces(updated);
    setPlaces(updated);
    setShowRejectModal(false);
    setSelectedItems(prev => prev.filter(id => id !== rejectTargetId));
  };

  const handleBatchReject = () => {
    if (selectedItems.length === 0) return;
    setRejectTargetId('batch');
    setRejectReason('');
    setRejectCustom('');
    setShowRejectModal(true);
  };

  const confirmBatchReject = () => {
    const reason = rejectReason === 'other' ? rejectCustom : rejectReasons.find(r => r.value === rejectReason)?.label || '批量拒绝';
    const updated = places.map(p => 
      selectedItems.includes(p.id) ? { ...p, status: 'rejected', rejectReason: reason } : p
    );
    savePlaces(updated);
    setPlaces(updated);
    setShowRejectModal(false);
    setSelectedItems([]);
  };

  const handleDelete = (id) => {
    if (confirm('确定要删除这个地点吗？此操作不可恢复！')) {
      const updated = places.filter(p => p.id !== id);
      savePlaces(updated);
      setPlaces(updated);
    }
  };

  const handleBatchDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedItems.length} 个地点吗？此操作不可恢复！`)) {
      const updated = places.filter(p => !selectedItems.includes(p.id));
      savePlaces(updated);
      setPlaces(updated);
      setSelectedItems([]);
    }
  };

  const handleToggleStatus = (id) => {
    const updated = places.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'approved' ? 'hidden' : 'approved' };
      }
      return p;
    });
    savePlaces(updated);
    setPlaces(updated);
  };

  const handleSaveEdit = () => {
    const updated = places.map(p => p.id === editingPlace.id ? editingPlace : p);
    savePlaces(updated);
    setPlaces(updated);
    setEditingPlace(null);
  };

  const handleExport = () => {
    const data = places.map(p => ({
      名称: p.name,
      区域: p.region,
      地址: p.address,
      类型: p.type,
      综合评分: calculateRating(p.ratings || p.rating),
      场地大小: p.ratings?.space || '-',
      绿化程度: p.ratings?.green || '-',
      设施完善: p.ratings?.facilities || '-',
      狗友多少: p.ratings?.dogFriends || '-',
      牵绳友好: p.ratings?.leashFriendly || '-',
      停车便利: p.ratings?.parking || '-',
      评价次数: p.ratingCount,
      门票: p.ticket,
      停车费: p.parking,
      牵绳要求: p.leashRule,
      特色: p.features,
      评价: p.comment,
      状态: p.status === 'approved' ? '已通过' : p.status === 'pending' ? '待审核' : '已拒绝',
      提交时间: p.createdAt,
      发布者: p.createdBy
    }));
    
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `遛狗地点数据_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const toggleSelect = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredList.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredList.map(p => p.id));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">待审核</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">已通过</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">已拒绝</span>;
      case 'hidden':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">已隐藏</span>;
      default:
        return null;
    }
  };

  const ratingItems = [
    { key: 'space', label: '场地大小' },
    { key: 'green', label: '绿化程度' },
    { key: 'facilities', label: '设施完善' },
    { key: 'dogFriends', label: '狗友多少' },
    { key: 'leashFriendly', label: '牵绳友好' },
    { key: 'parking', label: '停车便利', isExtra: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">后台管理系统</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">待审核</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{pendingPlaces.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">已通过</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{approvedPlaces.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">已拒绝</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{rejectedPlaces.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Star className="w-4 h-4" />
            <span className="text-sm">总评价</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalRatings}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">平均评分</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.avgRating}</div>
        </div>
      </div>

      {/* 批量操作栏 */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-700">已选择 <strong>{selectedItems.length}</strong> 项</span>
            <div className="flex gap-2">
              <button
                onClick={handleBatchApprove}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Check className="w-4 h-4" /> 批量通过
              </button>
              <button
                onClick={handleBatchReject}
                className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                <X className="w-4 h-4" /> 批量拒绝
              </button>
              <button
                onClick={handleBatchDelete}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash className="w-4 h-4" /> 批量删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 标签页和搜索 */}
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <div className="flex gap-2 border-b">
          {[
            { key: 'pending', label: '待审核', count: pendingPlaces.length, color: 'yellow' },
            { key: 'approved', label: '已通过', count: approvedPlaces.length, color: 'green' },
            { key: 'rejected', label: '已拒绝', count: rejectedPlaces.length, color: 'red' },
            { key: 'all', label: '全部', count: places.length, color: 'blue' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedItems([]); }}
              className={`px-4 py-2 -mb-px transition flex items-center gap-2 ${
                activeTab === tab.key
                  ? `border-b-2 border-${tab.color}-600 text-${tab.color}-600 font-medium`
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 bg-${tab.color}-100 text-${tab.color}-600 text-xs rounded-full`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索地点..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-lg w-64"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
        </div>
      </div>

      {/* 全选 */}
      {filteredList.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            checked={selectedItems.length === filteredList.length && filteredList.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-600">全选</span>
          <span className="text-sm text-gray-400">({filteredList.length} 项)</span>
        </div>
      )}

      {/* 列表内容 */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">暂无数据</div>
        ) : (
          filteredList.map(place => (
            <div key={place.id} className={`bg-white rounded-lg shadow-sm border p-4 ${selectedItems.includes(place.id) ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(place.id)}
                    onChange={() => toggleSelect(place.id)}
                    className="w-4 h-4 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{place.name}</h3>
                      {getStatusBadge(place.status)}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {place.region} · {place.type} · {place.address}
                    </p>
                    
                    <div className="flex items-center gap-4 mb-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                        <span className="font-medium">{calculateRating(place.ratings || place.rating)}分</span>
                        <span className="text-gray-400">({place.ratingCount}次)</span>
                      </div>
                      <span>门票: {place.ticket}</span>
                      <span>牵绳: {place.leashRule}</span>
                    </div>
                    
                    {/* 评分维度 */}
                    {place.ratings && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {ratingItems.slice(0, 5).map(item => (
                          <span key={item.key} className="px-2 py-0.5 bg-gray-100 text-xs rounded">
                            {item.label}: {place.ratings[item.key]}
                          </span>
                        ))}
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs rounded">
                          停车: {place.ratings.parking}
                        </span>
                      </div>
                    )}

                    {place.rejectReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                        拒绝原因: {place.rejectReason}
                      </div>
                    )}

                    {place.features && (
                      <p className="text-sm text-gray-600 mt-2">特色: {place.features}</p>
                    )}
                    {place.comment && (
                      <p className="text-sm text-gray-500 mt-1">评价: {place.comment}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      提交: {place.createdAt} · {place.createdBy}
                      {place.contact && ` · 联系方式: ${place.contact}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-1 ml-4">
                  <button
                    onClick={() => setEditingPlace(place)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="编辑"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {place.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(place.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="通过"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(place.id)}
                        className="p-2 text-orange-500 hover:bg-orange-50 rounded"
                        title="拒绝"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {place.status === 'approved' && (
                    <button
                      onClick={() => handleToggleStatus(place.id)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      title={place.status === 'hidden' ? '显示' : '隐藏'}
                    >
                      {place.status === 'hidden' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(place.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 拒绝弹窗 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {rejectTargetId === 'batch' ? `拒绝选中的 ${selectedItems.length} 个地点` : '拒绝该地点'}
            </h2>
            
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600">请选择拒绝原因：</p>
              {rejectReasons.map(reason => (
                <label key={reason.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason.value}
                    checked={rejectReason === reason.value}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rejectReason"
                  value="other"
                  checked={rejectReason === 'other'}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-4 h-4"
                />
                <span>其他原因</span>
              </label>
              {rejectReason === 'other' && (
                <input
                  type="text"
                  placeholder="请输入原因"
                  value={rejectCustom}
                  onChange={(e) => setRejectCustom(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg mt-2"
                />
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={rejectTargetId === 'batch' ? confirmBatchReject : confirmReject}
                disabled={!rejectReason || (rejectReason === 'other' && !rejectCustom)}
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                确认拒绝
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑弹窗 */}
      {editingPlace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">编辑地点</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">名称</label>
                  <input
                    type="text"
                    value={editingPlace.name}
                    onChange={(e) => setEditingPlace({...editingPlace, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">区域</label>
                  <input
                    type="text"
                    value={editingPlace.region}
                    onChange={(e) => setEditingPlace({...editingPlace, region: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">地址</label>
                <input
                  type="text"
                  value={editingPlace.address}
                  onChange={(e) => setEditingPlace({...editingPlace, address: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">门票</label>
                  <input
                    type="text"
                    value={editingPlace.ticket}
                    onChange={(e) => setEditingPlace({...editingPlace, ticket: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">停车</label>
                  <input
                    type="text"
                    value={editingPlace.parking}
                    onChange={(e) => setEditingPlace({...editingPlace, parking: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">牵绳要求</label>
                <input
                  type="text"
                  value={editingPlace.leashRule}
                  onChange={(e) => setEditingPlace({...editingPlace, leashRule: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">特色描述</label>
                <textarea
                  value={editingPlace.features}
                  onChange={(e) => setEditingPlace({...editingPlace, features: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">用户评价</label>
                <textarea
                  value={editingPlace.comment}
                  onChange={(e) => setEditingPlace({...editingPlace, comment: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                保存
              </button>
              <button
                onClick={() => setEditingPlace(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
