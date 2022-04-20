<template>
  <section id="option-section">
    <el-tabs v-model="activeName">
      <el-tab-pane name="about">
        <span slot="label">
          <i class="el-icon-info"></i>
          关于
        </span>
        <div style="text-align: center; padding-top: 30px">
          <a
            href="https://github.com/wechatsync/Wechatsync"
            target="_blank"
            ><img src="/images/logo.png" height="60" /> <br />
            <p style="font-size: 22px; color: #222; margin-top: 10px">微信公众号同步助手</p></a
          >
          <div style="color: #777; margin-top: 50px">
            <p>插件版本：{{ currentVersion }}</p>
            <p>Github: <a href="https://github.com/wechatsync/Wechatsync" target="_blank">wechatsync/Wechatsync</a></p>
            <p>
              <a href="https://dun.mianbaoduo.com/@fun" target="_blank" class="mt-2 btn btn-outline-secondary">请作者吃饭<span style="">😋</span></a>
            </p>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane name="setting">
        <span slot="label">
          <i class="el-icon-setting"></i>
          配置
        </span>
        <div style="padding-top: 10px">
          <!-- {{ allServices }} -->
          <el-form :model="settings" ref="ruleForm" label-width="150px" class="demo-ruleForm">
            <!-- <el-form-item label="平台列表" prop="services">
              <el-checkbox-group v-model="settings.services">
                <el-checkbox v-for="service in allServices" :label="service.meta.displayName" :name="service.type" :key="service.type"></el-checkbox>
              </el-checkbox-group>
            </el-form-item> -->
            <el-form-item label="关闭文章底部签名" prop="disablePromotion">
              <el-switch v-model="settings.disablePromotion"></el-switch>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </section>
</template>

<script>
// import { callAllServiceMethod, getAllService } from '../providers/factory'
export default {
  data() {
    return {
      currentVersion: '1.0.12',
      loading: false,
      activeName: 'about',
      noResult: false,
      allServices: [],
      settings: {
        disablePromotion: false
      }
    }
  },
  mounted() {
    this.loadConfig((hasConfig) => {
      this.loadData(hasConfig)
    });
    document.body.classList.add('option')
  },
  watch: {
    settings: {
      handler() {
        this.saveConfig()
        console.log('settings changed', JSON.stringify(this.settings, null, 2))
      },
      deep: true
    },
  },
  methods: {
    loadConfig(cb) {
      getCache('settings', (result) => {
        var hasConfig = false
        if(result.settings) {
          hasConfig = true
          this.settings = JSON.parse(result.settings)
        }
        console.log(result)
        cb && cb(hasConfig)
      })
    },
    saveConfig() {
      setCache('settings', JSON.stringify(this.settings, null, 2))
    },
    async loadData(isFirst) {
    //   const allServices = getAllService()
    //   if(!isFirst) {
    //     this.settings.services = allServices.map(_ => _.meta.displayName)
    //   }
    //   this.allServices = allServices
      console.log('allServices', this.allServices, this.settings)
    },
  },
}
</script>
<style>
body.option {
  min-height: 450px;
  height: 100%;
  overflow: hidden;
  background: #eee;
}

#option-section {
  padding: 12px;
}
</style>
