<template>
  <el-form ref="form" :model="form" label-width="80px">
    <el-form-item :label="item.name" v-for="item in items" :key="item.prop">
      <el-radio-group v-model="form[item.prop]" v-if="item.type == 'radio'">
        <el-radio :label="option.value" v-for="option in item.values" :key="option.name">{{
          option.name
        }}</el-radio>
      </el-radio-group>
      <el-input
        v-model="form[item.prop]"
        placeholder="请输入内容"
        v-if="item.type == 'number'"
      ></el-input>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  props: ['styl', 'allow'],
  data() {
    return {
      form: {},
      items: [
        {
          name: '字体大小',
          prop: 'font-size',
          end: 'px',
          type: 'number',
        },
        {
          name: '字体风格',
          prop: 'font-style',
          fisrtOption: 'normal',
          type: 'radio',
          values: [
            {
              name: '正常',
              value: 'normal',
            },
            {
              name: '斜体',
              value: 'italic',
            },
            {
              name: '间接',
              value: 'oblique',
            },
          ],
        },
        {
          name: '字体对齐',
          prop: 'text-align',
          type: 'radio',
          fisrtOption: 'normal',
          values: [
            {
              name: '左对齐',
              value: 'left',
            },
            {
              name: '右对齐',
              value: 'right',
            },
            {
              name: '居中',
              value: 'center',
            },
          ],
        },
        {
          name: '字体加粗',
          prop: 'font-weight',
          fisrtOption: 'normal',
          type: 'radio',
          values: [
            {
              name: '正常',
              value: 'normal',
            },
            {
              name: '加粗',
              value: 'bold',
            },
          ],
        },
        {
          name: '字体装饰',
          prop: 'text-decoration',
          type: 'radio',
          fisrtOption: 'normal',
          values: [
            {
              name: '正常',
              value: 'none',
            },
            {
              name: '下划线',
              value: 'underline',
            },
            {
              name: '中线',
              value: 'line-through',
            },
          ],
        },
        {
          name: '行距',
          prop: 'line-height',
          end: '%',
          type: 'number',
        },
        {
          name: '字间距',
          prop: 'letter-spacing',
          type: 'number',
          end: 'px',
        },
        {
          name: '上边距',
          prop: 'margin-top',
          end: 'px',
          fisrtOption: 'normal',
          type: 'number',
        },
        {
          name: '下边距',
          end: 'px',
          prop: 'margin-bottom',
          fisrtOption: 'normal',
          type: 'number',
        },
      ],
    }
  },
  watch: {
    form: {
      handler() {
        var formatedStyles = {}
        for (var k in this.form) {
          var value = this.form[k]
          var def = this.items.filter((iy) => {
            return iy.prop && iy.prop == k
          })

          if (def.length) {
            value = value + (def[0].end ? def[0].end : '')
          }
          formatedStyles[k] = value
        }

        var arrayStyle = []

        for (var d in formatedStyles) {
          arrayStyle.push({
            name: d,
            value: formatedStyles[d],
          })
        }

        this.$emit('style', arrayStyle)
        console.log(this.form, arrayStyle)
      },
      deep: true,
    },
  },
  mounted() {
    if (this.styl) {
      this.styl.forEach((item) => {
        var value = item.value
        var def = this.items.filter((iy) => {
          return iy.prop && iy.prop == item.name
        })
        if (def.length) {
          value = value.replace(def[0].end ? def[0].end : '', '')
        }
        // this.form[ item.name] = value;
        this.$set(this.form, item.name, value)
      })
    }

    if (this.allow) {
      console.log('allow')
      this.items = this.items.filter((t) => {
        return this.allow.indexOf(t.prop) > -1
      })
      console.log('allow', this.allow, this.items)
    }

    if (this.only) {
      // this.items = this.items.filter(t => {
      //   return this.only.indexOf(t.prop) > -1;
      // });
    }
    // this.items.push({
    //   name: '字体风格',
    //   prop: 'font-style',
    //   fisrtOption: 'normal',
    //   values: [
    //     {
    //       name: "正常",
    //       value: "normal"
    //     },
    //     {
    //       name: "斜体",
    //       value: "italic"
    //     },
    //     {
    //       name: '间接',
    //       value: 'oblique'
    //     }
    //   ]
    // })
  },
}
</script>
