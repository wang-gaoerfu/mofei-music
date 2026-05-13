// pages/library/index.js
const musicService = require('../../services/music.js')
const auth = require('../../utils/auth.js')

Page({
  data: {
    musicList: [],
    totalCount: 0,
    currentPage: 1,
    hasMore: true,
    isLoading: false,
    activeFilter: 'all',
    statusFilters: [
      { name: '全部', value: 'all' },
      { name: '已完成', value: 'completed' },
      { name: '生成中', value: 'generating' }
    ],
    currentPlaying: null
  },

  onLoad() {
    this.loadMusicList()
  },

  onShow() {
    this.loadMusicList()
  },

  onPullDownRefresh() {
    this.setData({ currentPage: 1, musicList: [] })
    this.loadMusicList().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  loadMusicList() {
    this.setData({ isLoading: true })
    return musicService.getMusicList(this.data.currentPage).then(res => {
      const list = res.items || res || []
      this.setData({
        musicList: this.data.currentPage === 1 ? list : [...this.data.musicList, ...list],
        totalCount: res.total || list.length,
        hasMore: list.length >= 20,
        isLoading: false
      })
    }).catch(() => {
      this.setData({ isLoading: false, musicList: [] })
    })
  },

  loadMore() {
    if (this.data.isLoading || !this.data.hasMore) return
    this.setData({ currentPage: this.data.currentPage + 1 })
    this.loadMusicList()
  },

  switchFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ activeFilter: filter, currentPage: 1, musicList: [] })
    this.loadMusicList()
  },

  getStatusIcon(status) {
    const icons = {
      completed: '🎵',
      generating: '⏳',
      failed: '❌'
    }
    return icons[status] || '🎵'
  },

  getStatusText(status) {
    const texts = {
      completed: '已完成',
      generating: '生成中',
      failed: '失败'
    }
    return texts[status] || '未知'
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
    musicService.downloadMusic(uuid)
  },

  deleteMusic(e) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这首音乐吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用删除 API
          wx.showToast({ title: '删除成功', icon: 'success' })
          this.setData({ currentPage: 1, musicList: [] })
          this.loadMusicList()
        }
      }
    })
  },

  openPlayer() {
    // 可以跳转到播放页面
  },

  goCreate() {
    wx.switchTab({ url: '/pages/create/index' })
  }
})