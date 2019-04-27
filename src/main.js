import Vue from 'vue';
import Router from 'vue-router';
import './plugins/vuetify';
import App from './App.vue';

import routes from './routes';
import 'vuetify/dist/vuetify.min.css'; // Ensure you are using css-loader

const router = new Router({
  mode: 'history',
  routes,
});

Vue.config.productionTip = false;

Vue.use(Router);

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
