// pages/index/index.js
const api = require('../../utils/api.js')
const auth = require('../../utils/auth.js')

Page({
  data: {
    userInfo: null,
    totalCredits: 0,
    activeCategory: '全部',
    categories: [
      { name: '全部', icon: '🎵' },
      { name: '主歌', icon: '🎤' },
      { name: '副歌', icon: '🔥' },
      { name: '情绪', icon: '💫' },
      { name: '风格', icon: '✨' }
    ],
    examples: [],
    currentExamples: []
  },

  onLoad() {
    this.loadUserInfo()
    this.loadExamples()
  },

  onShow() {
    this.loadUserInfo()
  },

  onPullDownRefresh() {
    Promise.all([this.loadUserInfo(), this.loadExamples()]).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  loadUserInfo() {
    const userInfo = auth.getUserInfo()
    if (userInfo) {
      this.setData({
        userInfo,
        totalCredits: (userInfo.free_count || 0) + (userInfo.balance || 0)
      })
    } else {
      api.getUserInfo().then(res => {
        auth.setUserInfo(res)
        this.setData({
          userInfo: res,
          totalCredits: (res.free_count || 0) + (res.balance || 0)
        })
      }).catch(() => {})
    }
  },

  loadExamples() {
    api.getExamples().then(res => {
      this.setData({ examples: res }, () => {
        this.filterExamples()
      })
    }).catch(() => {
      // 使用默认示例
      this.setData({ examples: this.getDefaultExamples() }, () => {
        this.filterExamples()
      })
    })
  },

  getDefaultExamples() {
    return [
      {
        id: 1,
        name: '欢快流行',
        icon: '🎵',
        category: '风格',
        prompt: '欢快的流行歌曲，适合派对和健身',
        tags: ['流行', '欢快', '舞曲'],
        type: '风格'
      },
      {
        id: 2,
        name: '忧伤钢琴',
        icon: '🎹',
        category: '风格',
        prompt: '忧伤氛围的钢琴独奏，适合夜晚独处',
        tags: ['钢琴', '忧伤', '放松'],
        type: '风格'
      },
      {
        id: 3,
        name: '古风歌曲',
        icon: '🏯',
        category: '风格',
        prompt: '中国传统乐器伴奏的古风歌曲',
        tags: ['古风', '民乐', '中国风'],
        type: '风格'
      },
      {
        id: 4,
        name: '激情副歌',
        icon: '🔥',
        category: '副歌',
        prompt: '充满能量的副歌，适合高潮部分',
        tags: ['副歌', '高能', '情感'],
        type: '副歌'
      },
      {
        id: 5,
        name: '轻柔开场',
        icon: '🌅',
        category: '主歌',
        prompt: '轻柔渐进的前奏，吸引听众注意力',
        tags: ['前奏', '轻柔', '引导'],
        type: '主歌'
      },
      {
        id: 6,
        name: '浪漫氛围',
        icon: '💕',
        category: '情绪',
        prompt: '甜蜜浪漫的音乐，适合情侣场景',
        tags: ['浪漫', '甜蜜', '温馨'],
        type: '情绪'
      }
    ]
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ activeCategory: category }, () => {
      this.filterExamples()
    })
  },

  filterExamples() {
    const { examples, activeCategory } = this.data
    if (activeCategory === '全部') {
      this.setData({ currentExamples: examples })
    } else {
      const filtered = examples.filter(item =>
        item.category === activeCategory || item.type === activeCategory
      )
      this.setData({ currentExamples: filtered })
    }
  },

  useExample(e) {
    const example = e.currentTarget.dataset.example
    wx.navigateTo({
      url: `/pages/create/index?example=${encodeURIComponent(JSON.stringify(example))}`
    })
  },

  goCreate() {
    wx.switchTab({ url: '/pages/create/index' })
  },

  goLibrary() {
    wx.switchTab({ url: '/pages/library/index' })
  },

  goUser() {
    wx.switchTab({ url: '/pages/user/index' })
  }
})