const API_BASE = ''; // Use relative path for same-origin API calls

// 获取地点列表
export async function getPlaces() {
  try {
    const res = await fetch(`${API_BASE}/api/places`);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch (e) {
    console.error('API Error, falling back to localStorage:', e);
    const stored = localStorage.getItem('dogPlaces');
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem('dogPlaces', JSON.stringify(initialPlaces));
    return initialPlaces;
  }
}

// 保存地点（提交）
export async function savePlaces(places, newPlace) {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newPlace)
    });
    if (!res.ok) throw new Error('Failed to submit');
    const result = await res.json();
    return result;
  } catch (e) {
    console.error('Submit Error:', e);
    // Fallback to localStorage
    const updated = [...places, { ...newPlace, id: Date.now(), status: 'pending' }];
    localStorage.setItem('dogPlaces', JSON.stringify(updated));
    return { message: '已保存到本地（离线模式）' };
  }
}

// 计算综合评分（不含停车）
export function calculateRating(ratings) {
  if (!ratings) return 0;
  const { space, green, facilities, dogFriends, leashFriendly } = ratings;
  return ((space + green + facilities + dogFriends + leashFriendly) / 5).toFixed(1);
}

// 获取待审核的地点（管理员）
export async function getPendingPlaces() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/admin/places`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch');
    const places = await res.json();
    return places.filter(p => p.status === 'pending');
  } catch (e) {
    console.error('API Error:', e);
    const stored = localStorage.getItem('dogPlaces');
    if (stored) {
      const places = JSON.parse(stored);
      return places.filter(p => p.status === 'pending');
    }
    return [];
  }
}

// 遛狗地点数据
export const initialPlaces = [
  {
    id: 1,
    name: "马家湾湿地公园",
    region: "朝阳区",
    address: "朝阳区大鲁店北路38号",
    type: "湿地公园",
    rating: 5,
    ticket: "免费",
    parking: "免费",
    leashRule: "建议牵绳",
    size: "大型",
    features: "绿地广阔，河流，草坪大，有环形湖",
    activities: "野餐、跑步、拍照、赏花",
    comment: "平路很多，适合老人小孩，日落时分景色绝美",
    ratings: {
      space: 5,
      green: 5,
      facilities: 4,
      dogFriends: 5,
      leashFriendly: 4,
      parking: 5
    },
    ratingCount: 128,
    status: "approved",
    createdAt: "2024-01-15",
    createdBy: "系统"
  },
  {
    id: 2,
    name: "顺义减河公园",
    region: "顺义区",
    address: "顺义区右堤路东大桥环岛旁",
    type: "公园",
    rating: 5,
    ticket: "免费",
    parking: "免费",
    leashRule: "可不牵绳",
    size: "大型",
    features: "非常人性化，保安友好，园区干净",
    activities: "野餐、搭帐篷、聚会",
    comment: "可带猫咪和狗狗，大型犬也可进；晚上有大狗聚会",
    ratings: {
      space: 5,
      green: 4,
      facilities: 5,
      dogFriends: 5,
      leashFriendly: 5,
      parking: 5
    },
    ratingCount: 156,
    status: "approved",
    createdAt: "2024-01-15",
    createdBy: "系统"
  },
  {
    id: 3,
    name: "温榆河公园",
    region: "朝阳区",
    address: "朝阳区来广营北路",
    type: "郊野公园",
    rating: 5,
    ticket: "免费",
    parking: "免费",
    leashRule: "建议牵绳",
    size: "超大型",
    features: "北京最大的湿地公园，有多个分区",
    activities: "跑步、骑行、野餐",
    comment: "一期二期都很大，宠物友好",
    ratings: {
      space: 5,
      green: 5,
      facilities: 4,
      dogFriends: 4,
      leashFriendly: 4,
      parking: 4
    },
    ratingCount: 203,
    status: "approved",
    createdAt: "2024-01-15",
    createdBy: "系统"
  },
  {
    id: 4,
    name: "南海子公园",
    region: "大兴区",
    address: "大兴区瀛海镇南海子",
    type: "湿地公园",
    rating: 5,
    ticket: "免费",
    parking: "免费",
    leashRule: "建议牵绳",
    size: "超大型",
    features: "麋鹿苑、湿地、草坪广阔",
    activities: "观鸟、拍照、跑步",
    comment: "环境优美，狗狗可以草地奔跑",
    ratings: {
      space: 5,
      green: 5,
      facilities: 4,
      dogFriends: 4,
      leashFriendly: 4,
      parking: 5
    },
    ratingCount: 178,
    status: "approved",
    createdAt: "2024-01-15",
    createdBy: "系统"
  },
  {
    id: 5,
    name: "奥林匹克森林公园",
    region: "朝阳区",
    address: "朝阳区科荟路33号",
    type: "森林公园",
    rating: 4,
    ticket: "免费",
    parking: "付费",
    leashRule: "建议牵绳",
    size: "大型",
    features: "跑步圣地、绿化完善、设施齐全",
    activities: "跑步、健身、赏花",
    comment: "周末人比较多，但地方大",
    ratings: {
      space: 5,
      green: 5,
      facilities: 5,
      dogFriends: 3,
      leashFriendly: 3,
      parking: 3
    },
    ratingCount: 245,
    status: "approved",
    createdAt: "2024-01-15",
    createdBy: "系统"
  }
];
