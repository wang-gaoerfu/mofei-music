const api = require('../../utils/api.js')
const auth = require('../../utils/auth.js')

Page({
  data: {
    userInfo: null,
    balance: 0,
    totalEarnings: 0,
    selectedPackage: null,
    // 下载充值套餐（1元=1次下载）
    rechargePackages: [
      { amount: 5, price: 5, popular: false },
      { amount: 10, price: 9.9, popular: true },
      { amount: 20, price: 18, gift: 2, popular: false },
      { amount: 50, price: 45, gift: 5, popular: false }
    ],
    stats: {
      total: 0,
      completed: 0,
      published: 0,
      earnings: 0
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
        balance: userInfo.balance || 0,
        totalEarnings: userInfo.total_earnings || 0
      })
    }

    api.getUserInfo().then(res => {
      auth.setUserInfo(res)
      this.setData({
        userInfo: res,
        balance: res.balance || 0,
        totalEarnings: res.total_earnings || 0
      })
    }).catch(() => {})
  },

  loadStats() {
    api.getMusicList(1, 1).then(res => {
      this.setData({
        'stats.total': res.total || 0
      })
    }).catch(() => {})
  },

  selectPackage(e) {
    const amount = e.currentTarget.dataset.amount
    const pkg = this.data.rechargePackages.find(p => p.amount === amount)
    this.setData({ 
      selectedPackage: amount,
      selectedPrice: pkg ? pkg.price : 0
    })
  },

  getPackagePrice(amount) {
    const pkg = this.data.rechargePackages.find(p => p.amount === amount)
    return pkg ? pkg.price : 0
  },

  doRecharge() {
    const { selectedPackage } = this.data
    if (!selectedPackage) {
      wx.showToast({ title: '请选择套餐', icon: 'none' })
      return
    }

    const pkg = this.data.rechargePackages.find(p => p.amount === selectedPackage)
    if (!pkg) return

    wx.showModal({
      title: '确认充值',
      content: `确认充值 ${pkg.amount} 次下载，支付 ¥${pkg.price}？`,
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
      content: '音乐创作是一款 AI 音乐生成工具，让每个人都能轻松创作音乐。\\n\\n• 创作免费\\n• 发布到曲库供他人下载可获得收益\\n• 下载他人歌曲仅需 1 元/首\\n\\n版本：v1.0.0',
      showCancel: false
    })
  },

  contactService() {
    wx.showToast({ title: '客服功能开发中', icon: 'none' })
  }
})