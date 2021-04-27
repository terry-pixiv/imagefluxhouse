<template>
  <audio ref="audio" controls autoplay>{{ url }}</audio>
</template>

<script>
import Hls from "hls.js";

export default {
  props: ["url"],
  mounted() {
    let hls = new Hls();
    let audio = this.$refs["audio"];
    hls.loadSource(this.url);
    hls.attachMedia(audio);
    hls.on(Hls.Events.MANIFEST_PARSED, function() {
      audio.play();
    });
  },
};
</script>
