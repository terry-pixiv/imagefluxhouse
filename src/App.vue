<template>
  <v-app>
    <app-bar v-if="hasHeader"></app-bar>
    <v-main>
      <app-sora v-if="$store.getters.isSpeaker"></app-sora>
      <app-hls v-else-if="$store.getters.isListener"></app-hls>
      <router-view></router-view>
    </v-main>
    <app-footer v-if="hasHeader"></app-footer>
  </v-app>
</template>

<script>
import { auth } from "@/plugins/firebase";

export default {
  computed: {
    hasHeader() {
      return this.$route.matched.some((record) => record.meta?.requiresAuth);
    },
  },
  data: () => ({
    unsubscribe: null,
  }),

  created() {
    this.unsubscribe = auth.onAuthStateChanged((user) => {
      this.$store.dispatch("onAuthStateChanged", user);
    });
  },
  beforeDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  },

  watch: {
    "$store.getters.myroomId"() {
      this.$store.dispatch("myroom");
    },
  },
};
</script>

<style scoped>
.v-application {
  background-color: var(--v-background-base) !important;
}
</style>
