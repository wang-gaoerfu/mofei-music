// pages/library/index.js
const musicService = require('../../services/music.js')
const api = require('../../utils/api.js')
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

  publishMusic(e) {
    const uuid = e.currentTarget.dataset.uuid
    wx.showModal({
      title: '发布到公共曲库',
      content: '发布后，其他用户可以试听和下载（¥1/首），你的收益将自动累积',
      success: (res) => {
        if (res.confirm) {
          musicService.publishMusic(uuid).then(() => {
            wx.showToast({ title: '发布成功', icon: 'success' })
            // 更新列表中的状态
            const musicList = this.data.musicList.map(m => {
              if (m.uuid === uuid) {
                return { ...m, is_published: true }
              }
              return m
            })
            this.setData({ musicList })
          }).catch(() => {
            wx.showToast({ title: '发布失败', icon: 'none' })
          })
        }
      }
    })
  },

  unpublishMusic(e) {
    const uuid = e.currentTarget.dataset.uuid
    wx.showModal({
      title: '下架歌曲',
      content: '下架后，其他用户将无法再访问这首歌曲',
      success: (res) => {
        if (res.confirm) {
          musicService.unpublishMusic(uuid).then(() => {
            wx.showToast({ title: '已下架', icon: 'success' })
            const musicList = this.data.musicList.map(m => {
              if (m.uuid === uuid) {
                return { ...m, is_published: false }
              }
              return m
            })
            this.setData({ musicList })
          }).catch(() => {
            wx.showToast({ title: '下架失败', icon: 'none' })
          })
        }
      }
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