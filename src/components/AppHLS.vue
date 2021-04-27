<template>
  <div id="remote-hls-container" style="display:none">
    <div v-for="url in playlists" :key="url">
      <hls v-if="url" :url="url"></hls>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    playlists() {
      const ret = [];
      Object.keys(this.$store.state.myroom?.speakers).forEach(
        (speakerUserId) => {
          ret.push(
            this.$store.state.myroom?.speakers[speakerUserId].playlist_url
          );
        }
      );
      return ret;
    },
  },
};
</script>
