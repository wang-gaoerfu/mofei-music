// components/music-player/index.js
const api = require('../../utils/api.js')

Component({
  properties: {
    title: {
      type: String,
      value: '我的音乐'
    },
    src: {
      type: String,
      value: ''
    },
    uuid: {
      type: String,
      value: ''
    }
  },

  data: {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    innerAudioContext: null
  },

  lifetimes: {
    attached() {
      this._initAudio()
    },
    detached() {
      if (this.data.innerAudioContext) {
        this.data.innerAudioContext.destroy()
      }
    }
  },

  methods: {
    _initAudio() {
      const audio = wx.createInnerAudioContext()
      audio.src = this.data.src

      audio.onPlay(() => {
        this.setData({ isPlaying: true })
      })

      audio.onPause(() => {
        this.setData({ isPlaying: false })
      })

      audio.onTimeUpdate(() => {
        this.setData({
          currentTime: audio.currentTime,
          duration: audio.duration
        })
      })

      audio.onEnded(() => {
        this.setData({
          isPlaying: false,
          currentTime: 0
        })
      })

      audio.onError((err) => {
        wx.showToast({ title: '播放失败', icon: 'none' })
        this.setData({ isPlaying: false })
      })

      this.audioContext = audio
      this.setData({ innerAudioContext: audio })
    },

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '00:00'
      const min = Math.floor(seconds / 60)
      const sec = Math.floor(seconds % 60)
      return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    },

    onTogglePlay() {
      if (this.data.isPlaying) {
        this.audioContext.pause()
      } else {
        this.audioContext.play()
      }
    },

    onSeek(e) {
      const time = e.detail.value
      this.audioContext.seek(time)
    },

    onSeekChanging(e) {
      // 拖动中，不做处理
    },

    onPrev() {
      this.audioContext.seek(0)
    },

    onNext() {
      // 如果有下一首的逻辑，这里处理
      this.audioContext.seek(0)
    },

    onDownload() {
      if (!this.data.uuid) return
      const url = api.downloadMusic(this.data.uuid)
      wx.showLoading({ title: '正在下载...' })
      wx.downloadFile({
        url,
        success: (res) => {
          wx.hideLoading()
          if (res.statusCode === 200) {
            wx.saveFile({
              tempFilePath: res.tempFilePath,
              success: () => {
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
    },

    onRegenerate() {
      this.triggerEvent('regenerate', { uuid: this.data.uuid })
    }
  }
})