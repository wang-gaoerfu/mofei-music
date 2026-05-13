// utils/util.js

// 格式化时间（秒 -> mm:ss）
function formatTime(seconds) {
  if (!seconds || seconds < 0) return '00:00'
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// 格式化日期
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 显示加载中
function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  })
}

// 隐藏加载
function hideLoading() {
  wx.hideLoading()
}

// 显示成功提示
function showSuccess(title = '成功') {
  wx.showToast({
    title,
    icon: 'success'
  })
}

// 显示错误提示
function showError(title = '出错了') {
  wx.showToast({
    title,
    icon: 'none'
  })
}

// 节流函数
function throttle(fn, delay = 300) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last > delay) {
      last = now
      fn.apply(this, args)
    }
  }
}

module.exports = {
  formatTime,
  formatDate,
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  throttle
}