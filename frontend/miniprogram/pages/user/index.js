// pages/user/index.js
const api = require('../../utils/api.js')
const auth = require('../../utils/auth.js')

Page({
  data: {
    userInfo: null,
    totalCredits: 0,
    selectedPackage: null,
    rechargePackages: [
      { amount: 10, price: 9.9, gift: 0, popular: false },
      { amount: 30, price: 25, gift: 5, popular: true },
      { amount: 50, price: 38, gift: 12, popular: false },
      { amount: 100, price: 68, gift: 32, popular: false }
    ],
    stats: {
      total: 0,
      completed: 0,
      monthly: 0
    }
  },

  onLoad() {
    this.loadUserInfo()
    this.loadStats()
  },

  onShow() {
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = auth.getUserInfo()
    if (userInfo) {
      this.setData({
        userInfo,
        totalCredits: (userInfo.free_count || 0) + (userInfo.balance || 0)
      })
    }

    api.getUserInfo().then(res => {
      auth.setUserInfo(res)
      this.setData({
        userInfo: res,
        totalCredits: (res.free_count || 0) + (res.balance || 0)
      })
    }).catch(() => {})
  },

  loadStats() {
    // 从曲库 API 获取统计数据
    api.getMusicList(1, 1).then(res => {
      // 如果后端返回总数统计
      this.setData({
        'stats.total': res.total || 0,
        'stats.completed': res.completed || 0,
        'stats.monthly': res.monthly || 0
      })
    }).catch(() => {})
  },

  selectPackage(e) {
    const amount = e.currentTarget.dataset.amount
    this.setData({ selectedPackage: amount })
  },

  getPackagePrice(amount) {
    const pkg = this.data.rechargePackages.find(p => p.amount === amount)
    return pkg ? pkg.price : 0
  },

  doRecharge() {
    const { selectedPackage } = this.data
    if (!selectedPackage) return

    const pkg = this.data.rechargePackages.find(p => p.amount === selectedPackage)
    if (!pkg) return

    wx.showModal({
      title: '确认充值',
      content: `确认充值 ${pkg.amount} 次，支付 ¥${pkg.price}？`,
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用微信支付
          wx.showToast({
            title: '微信支付暂未开放',
            icon: 'none'
          })
        }
      }
    })
  },

  goHelp() {
    wx.showToast({ title: '帮助中心开发中', icon: 'none' })
  },

  goAbout() {
    wx.showModal({
      title: '关于我们',
      content: '音乐创作是一款 AI 音乐生成工具，让每个人都能轻松创作音乐。\n\n版本：v1.0.0',
      showCancel: false
    })
  },

  contactService() {
    wx.showToast({ title: '客服功能开发中', icon: 'none' })
  }
})