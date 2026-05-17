// pages/index/index.js
const musicService = require('../../services/music.js')
const api = require('../../utils/api.js')
const auth = require('../../utils/auth.js')

Page({
  data: {
    userInfo: null,
    balance: 0,
    publicList: [],
    currentPage: 1,
    hasMore: true,
    isLoading: false,
    currentPlaying: null,
    categories: [
      { name: '全部', value: 'all' },
      { name: '流行', value: '流行' },
      { name: '电子', value: '电子' },
      { name: '古典', value: '古典' },
      { name: '古风', value: '古风' },
      { name: '摇滚', value: '摇滚' }
    ],
    activeCategory: 'all'
  },

  onLoad() {
    this.loadUserInfo()
    this.loadPublicLibrary()
  },

  onShow() {
    this.loadUserInfo()
  },

  onPullDownRefresh() {
    this.setData({ currentPage: 1, publicList: [] })
    this.loadPublicLibrary().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  loadUserInfo() {
    const userInfo = auth.getUserInfo()
    if (userInfo) {
      this.setData({
        userInfo,
        balance: userInfo.balance || 0
      })
    }

    api.getUserInfo().then(res => {
      auth.setUserInfo(res)
      this.setData({
        userInfo: res,
        balance: res.balance || 0
      })
    }).catch(() => {})
  },

  loadPublicLibrary() {
    this.setData({ isLoading: true })
    return musicService.getPublicLibrary(this.data.currentPage).then(res => {
      const list = res.list || []
      this.setData({
        publicList: this.data.currentPage === 1 ? list : [...this.data.publicList, ...list],
        hasMore: list.length >= 20,
        isLoading: false
      })
    }).catch(() => {
      this.setData({ isLoading: false })
    })
  },

  loadMore() {
    if (this.data.isLoading || !this.data.hasMore) return
    this.setData({ currentPage: this.data.currentPage + 1 })
    this.loadPublicLibrary()
  },

  switchCategory(e) {
    const category = e.currentTarget.dataset.value
    this.setData({ activeCategory: category, currentPage: 1, publicList: [] })
    this.loadPublicLibrary()
  },

  playMusic(e) {
    const music = e.currentTarget.dataset.music
    if (music.status !== 'completed') {
      wx.showToast({ title: '音乐还在生成中', icon: 'none' })
      return
    }

    this.setData({ currentPlaying: music })

    const audioContext = wx.createInnerAudioContext()
    audioContext.src = music.audio_url || music.url
    audioContext.play()

    audioContext.onEnded(() => {
      this.setData({ currentPlaying: null })
      audioContext.destroy()
    })
  },

  downloadMusic(e) {
    const uuid = e.currentTarget.dataset.uuid
    const music = e.currentTarget.dataset.music
    const isOwner = this.data.userInfo && music.user_id === this.data.userInfo.id

    if (!isOwner) {
      // 检查余额
      if (this.data.balance < 1) {
        wx.showModal({
          title: '余额不足',
          content: '下载他人歌曲需要 1 元余额，是否去充值？',
          confirmText: '去充值',
          success: (res) => {
            if (res.confirm) {
              wx.switchTab({ url: '/pages/user/index' })
            }
          }
        })
        return
      }
    }

    wx.showModal({
      title: isOwner ? '下载歌曲' : '下载歌曲（¥1）',
      content: isOwner ? '确定下载这首歌曲吗？' : '确定支付 1 元下载这首歌曲吗？',
      success: (res) => {
        if (res.confirm) {
          musicService.downloadMusic(uuid).then(() => {
            wx.showToast({ title: '下载成功', icon: 'success' })
            // 刷新余额
            api.getUserInfo().then(res => {
              auth.setUserInfo(res)
              this.setData({ balance: res.balance || 0 })
            })
          }).catch(err => {
            if (err.message && err.message.includes('Balance')) {
              wx.showToast({ title: '余额不足', icon: 'none' })
            } else {
              wx.showToast({ title: '下载失败', icon: 'none' })
            }
          })
        }
      }
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