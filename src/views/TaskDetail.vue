<template>
  <section id="main-section">
    <header class="float-section-header">
      <a view-ref="back" @click="$router.back()" class="back-btn"
        ><img src="images/arrow-left.png" style="vertical-align: 0px"
      /></a>
      同步详情
    </header>
    <div class="add-account-form" style="background: white">
      <div class="media">
        <img
          class="align-self-center mr-3"
          :src="taskDetail.post.thumb"
          width="100"
        />
        <div class="media-body">
          <h6 class="mt-0 mb-2">{{ taskDetail.post.title }}</h6>
          <span v-if="taskDetail.status == 'wait'" class="badge badge-dark"
            >等待</span
          >
          <span v-if="taskDetail.status == 'uploading'" class="badge badge-info"
            >发布中</span
          >
          <span v-if="taskDetail.status == 'done'" class="badge badge-success"
            >已完成</span
          >
          <span v-if="taskDetail.status == 'failed'" class="badge badge-danger"
            >失败</span
          >
          <span v-if="taskDetail.status == 'failed'">
            <button
              type="submit"
              class="btn btn-primary ml-3"
              @click="addWordpressAccount"
            >
              重试
            </button>
          </span>
        </div>
      </div>
    </div>

    <h6 class="mt-3 ml-3 mb-3">账号</h6>
    <ul class="account-types" v-for="account in taskDetail.accounts">
      <li @click="addWordpress = true" class="media">
        <img
          :src="account.icon ? account.icon : 'images/wordpress.ico'"
          class="align-self-center mr-3 icon"
          height="35"
        />
        <div class="media-body">
          <h6 class="mb-0">{{ account.title }}</h6>
          <p class="mb-0">
            <span v-if="!account.editResp">{{ account.msg }}</span>
            <a
              :href="account.editResp.draftLink"
              v-if="account.type != 'wordpress' && account.editResp"
              target="_blank"
              >查看文章</a
            >
          </p>
        </div>
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  data() {
    return {
      taskDetail: {},
    }
  },
  mounted() {
    console.log(this.$route)
    this.taskDetail = db.getTask(this.$route.query.id)
  },
  methods: {},
}
</script>
