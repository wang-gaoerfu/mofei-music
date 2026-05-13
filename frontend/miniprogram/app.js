// app.js
const api = require('./utils/api.js')

App({
  globalData: {
    userInfo: null,
    token: null
  },

  onLaunch() {
    // 微信登录
    this.login()
  },

  login() {
    wx.login({
      success: (res) => {
        if (res.code) {
          api.register(res.code, '用户').then(data => {
            wx.setStorageSync('token', data.access_token)
            wx.setStorageSync('userInfo', data.user)
            this.globalData.userInfo = data.user
            this.globalData.token = data.access_token
          }).catch(err => {
            console.error('登录失败', err)
          })
        }
      }
    })
  },

  getUserInfo() {
    return this.globalData.userInfo || wx.getStorageSync('userInfo')
  },

  getToken() {
    return this.globalData.token || wx.getStorageSync('token')
  }
})