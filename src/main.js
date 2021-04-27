import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import store from "./store";
import upperFirst from "lodash/upperFirst";
import camelCase from "lodash/camelCase";

const requireComponent = require.context(
  "@/components",
  false,
  /[A-Z]\w+\.(vue|js)$/
);

requireComponent.keys().forEach((fileName) => {
  const componentConfig = requireComponent(fileName);
  const componentName = upperFirst(
    camelCase(
      fileName
        .split("/")
        .pop()
        .replace(/\.\w+$/, "")
    )
  );
  Vue.component(componentName, componentConfig.default || componentConfig);
});

Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  store,
  render: (h) => h(App),
}).$mount("#app");
