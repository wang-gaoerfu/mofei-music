// services/music.js

const api = require('../utils/api.js')

// 创建音乐任务
function createMusicTask(params) {
  const { prompt, style, lyrics, instrument, speed } = params
  return api.createMusic({
    prompt,
    style: style || [],
    lyrics,
    instrument,
    speed
  })
}

// 轮询音乐状态
function pollMusicStatus(taskId, onProgress, onComplete, onError) {
  let count = 0
  const maxAttempts = 60 // 最多轮询60次（约5分钟）

  function poll() {
    if (count >= maxAttempts) {
      onError && onError('生成超时，请稍后重试')
      return
    }

    api.getMusicStatus(taskId).then(res => {
      count++
      if (res.status === 'completed') {
        onComplete && onComplete(res)
      } else if (res.status === 'failed') {
        onError && onError(res.error || '生成失败')
      } else {
        // 继续轮询
        onProgress && onProgress(res.progress || count * 2)
        setTimeout(poll, 3000)
      }
    }).catch(err => {
      count++
      setTimeout(poll, 3000)
    })
  }

  poll()
}

// 获取音乐列表
function getMusicList(page = 1) {
  return api.getMusicList(page)
}

// 获取音乐详情
function getMusicDetail(uuid) {
  return api.getMusicDetail(uuid)
}

// 下载音乐
function downloadMusic(uuid) {
  const url = api.downloadMusic(uuid)
  wx.showLoading({ title: '正在下载...' })
  wx.downloadFile({
    url,
    success: (res) => {
      wx.hideLoading()
      if (res.statusCode === 200) {
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success: (saveRes) => {
            wx.showToast({ title: '保存成功', icon: 'success' })
          },
          fail: () => {
            wx.showToast({ title: '保存失败', icon: 'none' })
          }
        })
      }
    },
    fail: () => {
      wx.hideLoading()
      wx.showToast({ title: '下载失败', icon: 'none' })
    }
  })
}

// 发布音乐到公共曲库
function publishMusic(uuid) {
  return api.publishMusic(uuid)
}

// 从公共曲库下架
function unpublishMusic(uuid) {
  return api.unpublishMusic(uuid)
}

// 获取公共曲库
function getPublicLibrary(page = 1) {
  return api.getPublicLibrary(page)
}

module.exports = {
  createMusicTask,
  pollMusicStatus,
  getMusicList,
  getMusicDetail,
  downloadMusic,
  publishMusic,
  unpublishMusic,
  getPublicLibrary
}