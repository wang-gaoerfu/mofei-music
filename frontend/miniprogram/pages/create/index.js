// pages/create/index.js
const musicService = require('../../services/music.js')
const api = require('../../utils/api.js')
const auth = require('../../utils/auth.js')

Page({
  data: {
    prompt: '',
    lyrics: '',
    selectedStyles: [],
    selectedInstrument: '钢琴',
    selectedSpeed: '中速',
    isGenerating: false,
    progress: 0,
    generatingTitle: '正在生成音乐...',
    showPlayer: false,
    generatedMusic: null,
    styleTags: [
      { name: '流行', icon: '🎵' },
      { name: '电子', icon: '🎹' },
      { name: '古典', icon: '🎻' },
      { name: '爵士', icon: '🎷' },
      { name: '摇滚', icon: '🎸' },
      { name: '民谣', icon: '🪕' },
      { name: '古风', icon: '🏯' },
      { name: '嘻哈', icon: '🎤' },
      { name: '乡村', icon: '🤠' },
      { name: '拉丁', icon: '💃' }
    ],
    instruments: [
      { name: '钢琴', icon: '🎹' },
      { name: '吉他', icon: '🎸' },
      { name: '电子', icon: '🎛️' },
      { name: '提琴', icon: '🎻' },
      { name: '鼓组', icon: '🥁' },
      { name: '古筝', icon: '🪕' },
      { name: '笛子', icon: '🎵' },
      { name: '合成器', icon: '🎚️' }
    ],
    speeds: [
      { name: '慢速', bpm: '60 BPM' },
      { name: '中速', bpm: '90 BPM' },
      { name: '快速', bpm: '120 BPM' }
    ]
  },

  onLoad(options) {
    if (options.example) {
      try {
        const example = JSON.parse(decodeURIComponent(options.example))
        this.setData({
          prompt: example.prompt || '',
          selectedStyles: [example.category].filter(Boolean)
        })
      } catch (e) {}
    }
  },

  onPromptInput(e) {
    this.setData({ prompt: e.detail.value })
  },

  onLyricsInput(e) {
    this.setData({ lyrics: e.detail.value })
  },

  toggleStyle(e) {
    const style = e.currentTarget.dataset.style
    const { selectedStyles } = this.data
    const index = selectedStyles.indexOf(style)
    if (index > -1) {
      selectedStyles.splice(index, 1)
    } else {
      selectedStyles.push(style)
    }
    this.setData({ selectedStyles })
  },

  selectInstrument(e) {
    this.setData({ selectedInstrument: e.currentTarget.dataset.instrument })
  },

  selectSpeed(e) {
    this.setData({ selectedSpeed: e.currentTarget.dataset.speed })
  },

  onSubmit() {
    const { prompt, lyrics, selectedStyles, selectedInstrument, selectedSpeed, isGenerating } = this.data

    if (!prompt.trim()) {
      wx.showToast({ title: '请输入音乐描述', icon: 'none' })
      return
    }

    if (isGenerating) return

    // 创作免费，不再检查次数

    this.setData({
      isGenerating: true,
      progress: 0,
      showPlayer: false,
      generatingTitle: '正在创建音乐任务...'
    })

    // 模拟进度更新
    this._progressTimer = setInterval(() => {
      const { progress } = this.data
      if (progress < 85) {
        this.setData({ progress: progress + Math.random() * 15 })
      }
    }, 500)

    musicService.createMusicTask({
      prompt,
      style: selectedStyles,
      lyrics,
      instrument: selectedInstrument,
      speed: selectedSpeed
    }).then(res => {
      this.setData({ generatingTitle: 'AI正在生成中...' })
      this._pollStatus(res.task_id)
    }).catch(err => {
      clearInterval(this._progressTimer)
      this.setData({ isGenerating: false })
      wx.showToast({ title: err.message || '创建失败', icon: 'none' })
    })
  },

  _pollStatus(taskId) {
    musicService.pollMusicStatus(
      taskId,
      (progress) => {
        // 更新进度
        this.setData({ progress: Math.min(progress, 90) })
      },
      (result) => {
        // 完成
        clearInterval(this._progressTimer)
        this.setData({
          progress: 100,
          generatingTitle: '生成完成！'
        })

        setTimeout(() => {
          this.setData({
            isGenerating: false,
            showPlayer: true,
            generatedMusic: {
              title: result.title || '我的音乐',
              url: result.audio_url,
              uuid: result.uuid
            }
          })

          // 刷新用户信息
          api.getUserInfo().then(userInfo => {
            auth.setUserInfo(userInfo)
          })
        }, 500)
      },
      (error) => {
        clearInterval(this._progressTimer)
        this.setData({ isGenerating: false })
        wx.showToast({ title: error, icon: 'none' })
      }
    )
  },

  onDownload(e) {
    const uuid = e.detail.uuid
    musicService.downloadMusic(uuid)
  },

  onRegenerate(e) {
    // 重新生成，保留当前参数
    this.setData({ showPlayer: false, generatedMusic: null }, () => {
      this.onSubmit()
    })
  },

  onUnload() {
    if (this._progressTimer) {
      clearInterval(this._progressTimer)
    }
  }
})