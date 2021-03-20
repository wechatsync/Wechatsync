import Vue from 'vue'
import VueRouter from 'vue-router'
import ExplorerMain from "./components/Explorer/Main.vue";

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: "explorer",
      component: ExplorerMain
    }
  ]
})

export default router;
