import { useState, useEffect } from 'react';
import { getPlaces, calculateRating } from '../data/places';
import { MapPin, Star, Car, Ticket, Ruler, Sparkles, ThumbsUp, TreePine, Warehouse, Users, Lock } from 'lucide-react';

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [filter, setFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    getPlaces().then(data => {
      setPlaces(data.filter(p => p.status === 'approved'));
    });
  }, []);

  const regions = [...new Set(places.map(p => p.region))];

  const filteredPlaces = places.filter(p => {
    const matchRating = filter === 'all' || parseFloat(calculateRating(p.ratings)) >= parseInt(filter);
    const matchRegion = regionFilter === 'all' || p.region === regionFilter;
    const matchSearch = p.name.includes(search) || p.address.includes(search);
    return matchRating && matchRegion && matchSearch;
  });

  const getRatingStars = (rating) => {
    const r = Math.round(rating);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-800';
    if (rating >= 4) return 'bg-blue-100 text-blue-800';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return '遛狗圣地';
    if (rating >= 4) return '推荐前往';
    if (rating >= 3) return '一般可选';
    return '不太推荐';
  };

  // 评分维度配置
  const ratingItems = [
    { key: 'space', label: '场地大小', icon: Ruler, desc: '活动空间是否充足' },
    { key: 'green', label: '绿化程度', icon: TreePine, desc: '环境绿化好不好' },
    { key: 'facilities', label: '设施完善', icon: Warehouse, desc: '卫生间、饮水点等' },
    { key: 'dogFriends', label: '狗友多少', icon: Users, desc: '遇到的狗友多不多' },
    { key: 'leashFriendly', label: '牵绳友好', icon: Lock, desc: '是否允许松开狗绳' },
    { key: 'parking', label: '停车便利', icon: Car, desc: '停车是否方便（不计入总分）', isExtra: true },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 搜索和筛选 */}
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">北京遛狗地点大全</h1>
        <p className="text-gray-600">发现北京最适合遛狗的公园、绿地和公共场所</p>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <input
            type="text"
            placeholder="搜索地点名称或地址..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">全部评分</option>
            <option value="4">4分以上</option>
            <option value="3">3分以上</option>
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">全部区域</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{places.length}</div>
          <div className="text-gray-600">地点总数</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">{places.filter(p => parseFloat(calculateRating(p.ratings)) >= 4.5).length}</div>
          <div className="text-gray-600">遛狗圣地</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{regions.length}</div>
          <div className="text-gray-600">覆盖区域</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-orange-600">{places.reduce((sum, p) => sum + (p.ratingCount || 0), 0)}</div>
          <div className="text-gray-600">总评价次数</div>
        </div>
      </div>

      {/* 地点列表 */}
      <div className="grid gap-6">
        {filteredPlaces.map(place => {
          const综合评分 = parseFloat(calculateRating(place.ratings));
          const isExpanded = expandedId === place.id;
          
          return (
            <div key={place.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition">
              {/* 主体内容 */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">{place.name}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                      <MapPin className="w-4 h-4" />
                      {place.region} · {place.type}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(综合评分)}`}>
                      {综合评分}分 {getRatingStars(综合评分)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{getRatingLabel(综合评分)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-gray-400" />
                    <span>{place.ticket}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-400" />
                    <span>{place.parking}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-gray-400" />
                    <span>{place.size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{place.ratingCount}次评价</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {place.leashRule}
                  </span>
                  {place.activities.split('、').map((activity, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                      {activity}
                    </span>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500 mt-1" />
                    <p className="text-gray-600 text-sm">{place.comment}</p>
                  </div>
                </div>

                {/* 展开多维评分 */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : place.id)}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {isExpanded ? '收起' : '查看'}详细评分
                  <ThumbsUp className="w-4 h-4" />
                </button>
              </div>

              {/* 多维评分详情 */}
              {isExpanded && (
                <div className="bg-gray-50 px-6 pb-6 rounded-b-xl">
                  <h4 className="font-medium text-gray-800 mb-4 pt-4 border-t">多维评分详情</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ratingItems.map(item => {
                      const value = place.ratings?.[item.key] || 0;
                      const Icon = item.icon;
                      return (
                        <div key={item.key} className={`bg-white p-3 rounded-lg ${item.isExtra ? 'border-2 border-orange-200' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{item.label}</span>
                            {item.isExtra && <span className="text-xs text-orange-500">(额外)</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${item.isExtra ? 'bg-orange-400' : 'bg-blue-500'}`}
                                style={{ width: `${(value / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{value}分</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>综合评分：{综合评分}分</strong> 
                      <span className="text-blue-600">（场地大小+绿化程度+设施完善+狗友多少+牵绳友好，停车便利为额外项不计入）</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredPlaces.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          没有找到符合条件的地点
        </div>
      )}
    </div>
  );
}
