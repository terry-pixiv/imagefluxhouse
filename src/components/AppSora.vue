<template>
  <div id="remote-audio-container" style="display:none"></div>
</template>

<script>
import Sora from "sora-js-sdk";

export default {
  data: () => ({
    sendrecv: null, // sora接続オブジェクト
    mystream: null,
  }),

  mounted() {
    this.startTalk();
  },

  beforeDestroy() {
    this.stopTalk();
  },

  methods: {
    stopTalk() {
      if (this.sendrecv) {
        this.sendrecv.disconnect();
        this.sendrecv = null;
      }
      if (this.mystream) {
        this.mystream.getTracks().forEach(function(track) {
          track.stop();
        });
        this.mystream = null;
      }
    },
    async startTalk() {
      if (this.sendrecv) {
        console.error("already connected to sora");
        return;
      }
      const debug = true;
      const sora = Sora.connection(
        this.$store.state.myroom.channelInfo.sora_url,
        debug
      );
      const metadata = "";
      const options = {
        multistream: true,
        audio: true,
        video: false,
        audioBitRate: 32,
        clientId: this.$store.state.myuid,
      };
      this.sendrecv = sora.sendrecv(
        this.$store.state.myroom.channelInfo.channel_id,
        metadata,
        options
      );
      this.mystream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      this.sendrecv.on("track", (event) => {
        console.error("track", event);
        if (event.track.kind != "audio") return;
        const stream = event.streams[0];
        const remoteAudioId = "remote-audio-" + stream.id;
        const audio = document.createElement("audio");
        audio.id = remoteAudioId;
        audio.autoplay = true;
        audio.srcObject = stream;
        document.querySelector("#remote-audio-container").appendChild(audio);
      });
      this.sendrecv.on("removetrack", (event) => {
        console.error("removeTrack", event);
        if (event.track.kind != "audio") return;
        const remoteAudioId = "remote-audio-" + event.target.id;
        const audio = document.querySelector("#" + remoteAudioId);
        audio.pause();
        audio.srcObject = null;
        document.querySelector("#remote-audio-container").removeChild(audio);
      });
      this.sendrecv.connect(this.mystream);
    },
  },

  watch: {
    "$store.getters.mute"(mute) {
      this.mystream.getAudioTracks()[0].enabled = !mute;
    },
  },
};
</script>
