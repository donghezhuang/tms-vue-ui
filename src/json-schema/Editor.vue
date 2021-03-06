<template>
  <tms-flex>
    <el-tree
      :data="data"
      :props="defaultProps"
      default-expand-all
      :expand-on-click-node="false"
      @node-click="onNodeClick"
      draggable
      :allow-drag="allowDrag"
      :allow-drop="allowDrop"
      @node-drop="onDragNode"
    ></el-tree>
    <el-form label-width="80px" :model="form" :disabled="!form.node">
      <el-form-item label="键值">
        <el-input v-model="form.key" @change="onChangeKey"></el-input>
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="form.schema.type" placeholder="请选择类型">
          <el-option label="integer" value="integer"></el-option>
          <el-option label="number" value="number"></el-option>
          <el-option label="string" value="string"></el-option>
          <el-option label="object" value="object"></el-option>
          <el-option label="array" value="array"></el-option>
          <el-option label="boolean" value="boolean"></el-option>
          <el-option label="null" value="null"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="格式" v-if="formats">
        <el-select v-model="form.schema.format" placeholder="请选择格式">
          <el-option
            v-for="format in formats"
            :key="format.value"
            :label="format.label"
            :value="format.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="标题">
        <el-input v-model="form.schema.title"></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <el-input type="textarea" v-model="form.schema.description"></el-input>
      </el-form-item>
      <el-form-item label="必填">
        <el-switch v-model="form.schema.required"></el-switch>
      </el-form-item>
      <el-form-item label="设置范围">
        <el-switch v-model="form.hasEnum" @change="onChangeHasEnum"></el-switch>
      </el-form-item>
      <el-form-item label="选择范围" v-if="form.hasEnum">
        <tms-flex v-for="(v, i) in form.schema.enum" :key="i">
          <el-input
            size="mini"
            v-model="v.value"
            @input="onSetValue(v.value, i)"
            :disabled="v.disabled"
          ></el-input>
          <el-input size="mini" v-model="v.label" @input="onSetLabel(v.label, i)"></el-input>
          <el-button size="mini" type="text" @click="onDelOption(v, i)">删除</el-button>
        </tms-flex>
        <el-button size="mini" type="primary" @click="onAddOption">新增选项</el-button>
      </el-form-item>
      <el-form-item label="默认值">
        <el-select
          v-if="form.hasEnum"
          v-model="form.schema.default"
          placeholder="请选择默认值"
          :multiple="form.schema.type === 'array'"
        >
          <el-option value v-if="form.schema.type === 'string'"></el-option>
          <el-option
            v-for="format in form.schema.enum"
            :key="format.value"
            :label="format.label"
            :value="format.value"
          ></el-option>
        </el-select>
        <el-input v-else v-model="form.schema.default"></el-input>
      </el-form-item>
      <el-form-item label="至少选" v-if="form.schema.type === 'array'&&form.hasEnum">
        <el-input-number v-model="form.schema.minItems"></el-input-number>
      </el-form-item>
      <el-form-item label="最多选" v-if="form.schema.type === 'array'&&form.hasEnum">
        <el-input-number v-model="form.schema.maxItems"></el-input-number>
      </el-form-item>
      <component :is="compFormatAttrs" v-bind.sync="form.schema.formatAttrs"></component>
      <slot name="extKeywords" :schema="form.schema"></slot>
      <el-form-item>
        <el-button size="mini" @click="onRemoveNode">删除</el-button>
        <el-button
          size="mini"
          @click="onAppendNode"
          v-if="form.schema.type === 'object' || form.schema.type === 'array'"
        >添加属性</el-button>
      </el-form-item>
    </el-form>
    <div style="flex:1">{{jsonString}}</div>
  </tms-flex>
</template>
    
    
<script>
import Vue from 'vue'
import {
  Tabs,
  TabPane,
  Tree,
  Form,
  FormItem,
  Input,
  InputNumber,
  Select,
  Option,
  Button,
  Switch,
  Radio,
  RadioGroup,
  Dialog,
} from 'element-ui'
Vue.use(Tabs)
  .use(TabPane)
  .use(Tree)
  .use(Form)
  .use(FormItem)
  .use(Input)
  .use(InputNumber)
  .use(Select)
  .use(Option)
  .use(Button)
  .use(Switch)
  .use(Radio)
  .use(RadioGroup)
  .use(Dialog)

/**
 *
 */
class SchemaWrap {
  /**
   *
   * @param {*} key
   * @param {Object} schema
   */
  constructor(key, schema, parent) {
    this.key = key
    this.label = key
    this.schema = schema
    this.parent = parent
  }
  appendChild(child) {
    this.children.push(child)
    this.schema.type === 'object'
      ? Vue.set(this.schema.properties, child.key, child.schema)
      : Vue.set(this.schema, child.key, child.schema)
    child.parent = this
  }
}
/**
 * 构造树节点
 */
SchemaWrap.build = function (key, schema, parent) {
  let wrap = new SchemaWrap(key, schema, parent)
  switch (schema.type) {
    case 'object':
      if (typeof schema.properties === 'object') {
        wrap.children = Object.entries(schema.properties).map(([k, s]) => {
          if (schema.required && schema.required.includes(k)) {
            s.required = true
          }
          return SchemaWrap.build(k, s, wrap)
        })
      }
      break
    case 'array':
      if (typeof schema.items === 'object') {
        wrap.children = Object.entries(schema)
          .filter(([k]) => k === 'items')
          .map(([k, s]) => SchemaWrap.build(k, s, wrap))
      }
      break
  }
  return wrap
}

class FormData {
  constructor() {
    this.reset()
  }
  reset() {
    this.key = ''
    this.schema = {
      title: '',
      type: 'string',
      description: '',
      required: false,
      properties: {},
    }
    this.node = null
  }
}

const Type2Format = {
  string: [
    { value: 'name', label: '姓名' },
    { value: 'email', label: '邮箱' },
    { value: 'mobile', label: '手机' },
  ],
  object: [
    { value: 'file', label: '文件' },
    { value: 'image', label: '图片' },
    { value: 'url', label: '链接' },
    { value: 'score', label: '打分' },
  ],
}

import File from './formats/File'
import { showAsDialog as fnShowDependencyDlg } from './DependencyDlg'

const Format2Comp = {
  file: File,
}

export default {
  name: 'tms-json-schema',
  props: { schema: Object, extendSchema: Function },
  data() {
    return {
      activeL0Pane: 'properties',
      activeL1Pane: 'dependencies',
      form: new FormData(),
      data: [],
      isParentArray: false,
      defaultProps: {
        children: 'children',
        label: 'label',
      },
      jsonString: '',
    }
  },
  computed: {
    compFormatAttrs() {
      const format = this.form.schema.format
      switch (format) {
        case 'file':
          return File
      }
      return null
    },
    formats() {
      const type = this.form.schema.type
      return Type2Format[type]
        ? [{ value: undefined, label: '无' }].concat(Type2Format[type])
        : null
    },
  },
  watch: {
    schema: {
      handler: function (val) {
        this.jsonString = typeof val === 'object' ? JSON.stringify(val) : '{}'
      },
      deep: true,
      immediate: true,
    },
    'form.schema.format': {
      handler: function (val) {
        if (
          Format2Comp[val] &&
          typeof Format2Comp[val].defaultFormatAttrs === 'function'
        ) {
          if (!this.form.schema.formatAttrs)
            this.$set(
              this.form.schema,
              'formatAttrs',
              Format2Comp[val].defaultFormatAttrs()
            )
        }
      },
      immediate: true,
    },
  },
  methods: {
    onChangeHasEnum(bHasEnum) {
      if (bHasEnum)
        this.$set(this.form.schema, 'enum', [
          { label: '选项1', value: 'a' },
          { label: '选项2', value: 'b' },
        ])
      else this.$delete(this.form.schema, 'enum')
    },
    onAddOption() {
      this.form.schema.enum.push({
        label: '新选项',
        value: 'newKey',
      })
    },
    onDelOption(v, i) {
      this.form.schema.enum.splice(i, 1)
    },
    onSetValue(v, i) {
      let item = this.form.schema.enum[i]
      item['value'] = v
      this.$set(this.form.schema.enum, i, item)
    },
    onSetLabel(v, i) {
      let item = this.form.schema.enum[i]
      item['label'] = v
      this.$set(this.form.schema.enum, i, item)
    },
    onDragNode(draggingNode, dropNode) {
      let children = dropNode.data.parent.children
      let { properties } = this.schema
      let newProperties = {}
      children.map((d) => {
        newProperties[d.key] = properties[d.key]
      })
      dropNode.data.parent.schema.properties = newProperties
    },
    allowDrop(draggingNode, dropNode, type) {
      if (draggingNode.level === dropNode.level) {
        return type === 'prev' || type === 'next'
      } else {
        return false
      }
    },
    allowDrag(draggingNode) {
      return draggingNode.level === 2
    },
    onNodeClick(schemaWrap, node) {
      const { key, schema } = schemaWrap
      schema.required = !!schema.required
      // 添加依赖关系定义
      if (!schema.dependencies || typeof schema.dependencies !== 'object')
        this.$set(schema, 'dependencies', {})
      this.form.key = key
      this.form.schema = schema
      this.form.node = node
      this.form.hasEnum = Array.isArray(schema.enum) ? true : false
      if (this.extendSchema) this.extendSchema(this, schema)
    },
    onChangeKey() {
      const schemaWrap = this.form.node.data
      if (this.form.key !== schemaWrap.key) {
        const newKey = this.form.key
        if (schemaWrap.parent && schemaWrap.parent.schema.properties) {
          this.$delete(schemaWrap.parent.schema.properties, schemaWrap.key)
          this.$set(
            schemaWrap.parent.schema.properties,
            newKey,
            schemaWrap.schema
          )
        }
        schemaWrap.label = schemaWrap.key = newKey
      }
    },
    onAppendNode() {
      const data = this.form.node.data
      const { schema, children } = data
      let newChild
      if (!Array.isArray(children)) {
        this.$set(data, 'children', [])
      }
      if (schema.type === 'object') {
        if (
          typeof schema.properties !== 'object' ||
          Array.isArray(schema.properties)
        ) {
          this.$set(schema, 'properties', {})
        }
        newChild = new SchemaWrap('newKey', {
          type: 'string',
        })
      } else if (schema.type === 'array') {
        if (schema.items) return
        newChild = new SchemaWrap('items', { type: 'object' })
      }

      if (this.extendSchema) this.extendSchema(this, schema)

      data.appendChild(newChild)
    },
    onRemoveNode() {
      const { parent, data } = this.form.node
      const children = parent.data.children || parent.data
      const index = children.findIndex((d) => d.key === data.key)
      children.splice(index, 1)
      const properties = parent.data.schema.properties
      properties && this.$delete(properties, data.key)
      this.form.reset()
    },
    /* 添加属性依赖规则 */
    onAddDependency() {
      let dependencies = this.form.schema.dependencies
      fnShowDependencyDlg(this.form.schema).then((result) => {
        if (result) {
          let { property, rules, operator } = result
          let newRules = rules.reduce((a, rule) => {
            a[rule.property] = rule.value
            return a
          }, {})
          this.$set(dependencies, property, { rules: newRules, operator })
        }
      })
    },
    /* 修改属性依赖规则 */
    onSetDependency(propName) {
      let dependencies = this.form.schema.dependencies
      fnShowDependencyDlg(
        this.form.schema,
        propName,
        dependencies[propName]
      ).then((result) => {
        if (result) {
          let { property, rules, operator } = result
          let newRules = rules.reduce((a, rule) => {
            a[rule.property] = rule.value
            return a
          }, {})
          this.$set(dependencies, property, { rules: newRules, operator })
        }
      })
    },
    /* 删除属性依赖规则 */
    onDelDependency(propName) {
      this.$delete(this.form.schema.dependencies, propName)
    },
  },
  mounted() {
    const root = SchemaWrap.build('root', this.schema)
    this.data = [root]
  },
  /**
   * 设置格式特定属性的编辑组件
   */
  setFormatAttrsComp(format, comp) {
    Format2Comp[format] = comp
  },
}
</script>
