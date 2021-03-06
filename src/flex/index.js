function addStyleClass(obj, prop, styleClass) {
  if (undefined === obj[prop]) {
    obj[prop] = [styleClass]
  } else if (Array.isArray(obj[prop])) {
    if (!obj[prop].includes(styleClass)) obj[prop].push(styleClass)
  } else if (typeof obj[prop] === 'object') {
    obj[prop][styleClass] = true
  } else if (typeof obj[prop] === 'string') {
    let regx = new RegExp(styleClass)
    if (!regx.test(obj[prop])) obj[prop] += ` ${styleClass}`
  }
  return obj
}

export default function(Vue) {
  Vue.component('tms-flex', {
    props: {
      direction: { type: String, default: 'row' },
      alignItems: { type: String },
      elasticItems: { type: Array },
      gap: { type: Number, default: 2 },
    },
    render(h) {
      let classes = ['tms-flex']
      classes.push(
        this.direction === 'column'
          ? 'tms-flex_column'
          : this.direction === 'row-reverse'
          ? 'tms-flex_row-reverse'
          : 'tms-flex_row'
      )
      classes.push(`tms-flex_gap_${this.gap}`)
      const alignItems = this.alignItems ? this.alignItems : this.direction === 'column' ? 'stretch' : 'flex-start'
      let items = this.$slots.default
      if (items && items.length) {
        items.forEach((item, index) => {
          if (undefined === item.data) item.data = {}
          addStyleClass(item.data, 'class', 'tms-flex__item')
          if (this.elasticItems && this.elasticItems.length && this.elasticItems.includes(index)) {
            addStyleClass(item.data, 'class', 'tms-flex__item_elastic')
          }
        })
      }
      return h('div', { class: classes, style: { alignItems } }, items)
    },
  })
}
