import { useState } from 'react';
import { getPlaces, savePlaces, calculateRating } from '../data/places';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Send, AlertCircle, Ruler, TreePine, Warehouse, Users, Lock, Car, Check } from 'lucide-react';

export default function Submit() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1); // 1: 评分  2: 填写信息
  
  const [ratings, setRatings] = useState({
    space: 0,
    green: 0,
    facilities: 0,
    dogFriends: 0,
    leashFriendly: 0,
    parking: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    region: '',
    address: '',
    type: '',
    ticket: '免费',
    parking: '免费',
    leashRule: '建议牵绳',
    size: '中型',
    features: '',
    activities: '',
    contact: '',
    comment: ''
  });

  const regions = ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '石景山区', '通州区', '昌平区', '顺义区', '大兴区', '房山区', '门头沟区', '怀柔区', '密云区', '延庆区', '平谷区'];
  const types = ['公园', '湿地公园', '森林公园', '郊野公园', '体育公园', '商场', '景区', '宠物乐园', '河畔', '水库', '户外草地', '寺庙', '其他'];
  const sizes = ['小型', '中型', '大型', '超大型'];
  const leashRules = ['可不牵绳', '建议牵绳', '必须牵绳', '必须推车'];

  const ratingItems = [
    { key: 'space', label: '场地大小', icon: Ruler, desc: '活动空间是否充足', example: '草坪大小、跑道长度' },
    { key: 'green', label: '绿化程度', icon: TreePine, desc: '环境绿化好不好', example: '树木多不多、草坪好不好' },
    { key: 'facilities', label: '设施完善度', icon: Warehouse, desc: '配套设施完善程度', example: '卫生间、饮水点、休息区' },
    { key: 'dogFriends', label: '狗友多少', icon: Users, desc: '遇到的狗友多不多', example: '人气旺不旺' },
    { key: 'leashFriendly', label: '牵绳友好度', icon: Lock, desc: '是否允许松开狗绳', example: '管理是否宽松' },
  ];

  const parkingItem = { key: 'parking', label: '停车便利', icon: Car, desc: '停车是否方便', example: '不计入综合评分', isExtra: true };

  const allRated = ratingItems.every(item => ratings[item.key] > 0);

  const handleRatingClick = (key, value) => {
    setRatings({...ratings, [key]: value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const places = await getPlaces();
    const 综合评分 = calculateRating(ratings);
    
    const newPlace = {
      id: Date.now(),
      ...formData,
      rating: 综合评分,
      ratings: ratings,
      ratingCount: 1,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: '用户'
    };
    
    await savePlaces([newPlace, ...places], newPlace);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Send className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">提交成功！</h2>
        <p className="text-gray-600 mb-8">
          感谢您对 {formData.name} 进行评价！<br/>
          您的评分和评价已提交，审核通过后将显示在首页。
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            返回首页
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setStep(1);
              setRatings({
                space: 0, green: 0, facilities: 0, dogFriends: 0, leashFriendly: 0, parking: 0
              });
              setFormData({
                name: '', region: '', address: '', type: '', ticket: '免费', parking: '免费',
                leashRule: '建议牵绳', size: '中型', features: '', activities: '', contact: '', comment: ''
              });
            }}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            继续评价
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 步骤指示器 */}
      <div className="flex items-center justify-center mb-8">
        <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            {step > 1 ? <Check className="w-4 h-4" /> : '1'}
          </div>
          <span className="ml-2 font-medium">先评分</span>
        </div>
        <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
        <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="ml-2 font-medium">填信息</span>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">为地点评分</h1>
          <p className="text-gray-600 mb-6">请先对地点进行多维评分，评分完成后再填写详细信息</p>

          <div className="space-y-6">
            {/* 综合评分预览 */}
            {allRated && (
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-blue-600 mb-1">综合评分（不含停车）</p>
                <div className="text-3xl font-bold text-blue-600">
                  {calculateRating(ratings)}分
                </div>
                <p className="text-xs text-blue-500 mt-1">
                  {calculateRating(ratings) >= 4.5 ? '遛狗圣地！' : 
                   calculateRating(ratings) >= 4 ? '推荐前往' : 
                   calculateRating(ratings) >= 3 ? '一般可选' : '不太推荐'}
                </p>
              </div>
            )}

            {/* 评分维度 */}
            {ratingItems.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-800">{item.label}</span>
                    <span className="text-sm text-gray-500">({item.desc})</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(value => (
                      <button
                        key={value}
                        onClick={() => handleRatingClick(item.key, value)}
                        className={`flex-1 py-2 rounded-lg transition ${
                          ratings[item.key] >= value 
                            ? 'bg-yellow-400 text-white' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">例如：{item.example}</p>
                </div>
              );
            })}

            {/* 停车便利（额外项） */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-gray-800">{parkingItem.label}</span>
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded">额外项不计入总分</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    onClick={() => handleRatingClick('parking', value)}
                    className={`flex-1 py-2 rounded-lg transition ${
                      ratings.parking >= value 
                        ? 'bg-orange-400 text-white' 
                        : 'bg-orange-100 text-orange-400 hover:bg-orange-200'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="text-xs text-orange-600 mt-1">例如：{parkingItem.example}</p>
            </div>

            <button
              onClick={() => allRated && setStep(2)}
              disabled={!allRated}
              className={`w-full py-3 rounded-lg font-medium transition ${
                allRated 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {allRated ? '评分完成，继续填写信息' : '请完成所有评分'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">填写详细信息</h1>
          <p className="text-gray-600 mb-6">已获得综合评分：<strong className="text-blue-600">{calculateRating(ratings)}分</strong></p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">基本信息</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地点名称 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：朝阳公园"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    所在区域 *
                  </label>
                  <select
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择区域</option>
                    {regions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  详细地址 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="请填写详细地址"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地点类型 *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择类型</option>
                    {types.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    场地大小
                  </label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {sizes.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 费用信息 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">费用与规定</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    门票价格
                  </label>
                  <input
                    type="text"
                    value={formData.ticket}
                    onChange={(e) => setFormData({...formData, ticket: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="免费 或 10元"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    停车费
                  </label>
                  <input
                    type="text"
                    value={formData.parking}
                    onChange={(e) => setFormData({...formData, parking: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="免费 或 10元/次"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  牵绳要求
                </label>
                <select
                  value={formData.leashRule}
                  onChange={(e) => setFormData({...formData, leashRule: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {leashRules.map(rule => (
                    <option key={rule} value={rule}>{rule}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 详细描述 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">详细描述</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  特色描述
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="描述这个地点的特点"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  适合活动
                </label>
                <input
                  type="text"
                  value={formData.activities}
                  onChange={(e) => setFormData({...formData, activities: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="如：野餐、跑步、拍照等，用顿号分隔"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  评价
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="分享你的真实体验"
                />
              </div>
            </div>

            {/* 联系方式 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">联系方式（选填）</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  您的联系方式
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="方便管理员联系您"
                />
              </div>
            </div>

            {/* 提示 */}
            <div className="flex items-center gap-2 bg-yellow-50 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                提交后需要管理员审核，审核通过后将在首页显示
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                返回评分
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                提交评价
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
