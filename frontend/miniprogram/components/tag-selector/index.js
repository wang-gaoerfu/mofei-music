// components/tag-selector/index.js
Component({
  properties: {
    tags: {
      type: Array,
      value: []
    },
    selected: {
      type: Array,
      value: []
    },
    multi: {
      type: Boolean,
      value: true
    }
  },

  methods: {
    onTap(e) {
      const tag = e.currentTarget.dataset.tag
      let { selected, multi } = this.data

      if (multi) {
        const index = selected.indexOf(tag)
        if (index > -1) {
          selected.splice(index, 1)
        } else {
          selected.push(tag)
        }
      } else {
        selected = [tag]
      }

      this.setData({ selected })
      this.triggerEvent('change', { selected })
    }
  }
})