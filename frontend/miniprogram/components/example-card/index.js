// components/example-card/index.js
Component({
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  methods: {
    onUse(e) {
      const example = e.currentTarget.dataset.example
      this.triggerEvent('use', { example })
    }
  }
})