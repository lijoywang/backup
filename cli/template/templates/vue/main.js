<%_ const isRouer = isRouter || false; _%>
import Vue from 'vue';
import App from './App.vue';
<%_ if (isRouer) { _%>
import router from './router';
<%_ } _%>

Vue.config.productionTip = false;

new Vue({
  <%_ if (isRouer) { _%>
  router,
  <%_ } _%>
  <%_ if (plugins.includes('bable')) { _%>
  render: h => h(App),
  <%_ } else { _%>
  render: function (h) { return h(App) },
  <%_ } _%>
}).$mount('#app');
