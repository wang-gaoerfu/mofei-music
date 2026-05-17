const API_BASE = 'http://localhost:8000/api'

function request(url, options = {}) {
  const token = wx.getStorageSync('token')
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}${url}`,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      ...options,
      success: (res) => {
        if (res.statusCode === 401) {
          wx.removeStorageSync('token')
          wx.reLaunch({ url: '/pages/index/index' })
          reject(new Error('Unauthorized'))
        } else if (res.statusCode >= 400) {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          })
          reject(res.data)
        } else {
          resolve(res.data)
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

module.exports = {
  // 用户相关
  register: (code, nickname) => request('/user/register', {
    method: 'POST',
    data: { code, nickname }
  }),

  getUserInfo: () => request('/user/info'),

  updateUser: (data) => request('/user/update', {
    method: 'PUT',
    data
  }),

  // 音乐相关
  createMusic: (data) => request('/music/create', {
    method: 'POST',
    data
  }),

  getMusicStatus: (taskId) => request(`/music/status/${taskId}`),

  getMusicDetail: (uuid) => request(`/music/${uuid}`),

  getMusicList: (page = 1, size = 20) => request(`/music/list?page=${page}&size=${size}`),

  downloadMusic: (uuid) => `${API_BASE}/music/download/${uuid}`,

  publishMusic: (uuid) => request(`/music/publish/${uuid}`, { method: 'POST' }),

  unpublishMusic: (uuid) => request(`/music/unpublish/${uuid}`, { method: 'POST' }),

  getPublicLibrary: (page = 1) => request(`/music/public/list?page=${page}`),

  // 示例相关
  getExamples: () => request('/examples'),

  // API_BASE 暴露给外部
  API_BASE
}