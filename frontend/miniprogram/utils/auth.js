// utils/auth.js

// 检查是否已登录
function isLoggedIn() {
  return !!wx.getStorageSync('token')
}

// 获取 Token
function getToken() {
  return wx.getStorageSync('token')
}

// 获取用户信息
function getUserInfo() {
  return wx.getStorageSync('userInfo')
}

// 设置用户信息
function setUserInfo(userInfo) {
  wx.setStorageSync('userInfo', userInfo)
}

// 清除登录信息
function clearAuth() {
  wx.removeStorageSync('token')
  wx.removeStorageSync('userInfo')
}

module.exports = {
  isLoggedIn,
  getToken,
  getUserInfo,
  setUserInfo,
  clearAuth
}