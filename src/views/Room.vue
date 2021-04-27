<template>
  <v-card
    height="100%"
    elevation="2"
    class="rounded-xl mt-4"
    v-if="this.$store.state.myroom"
  >
    <v-card-text>
      <div class="text--primary font-weight-bold pb-2">
        {{ this.$store.state.myroom.name }}
      </div>
      <div class="d-flex flex-wrap">
        <div
          v-for="user in this.$store.state.myroom.speakers"
          :key="user.userId"
          class="d-flex flex-column align-center mb-4"
          style="width:33%"
        >
          <div style="position:relative">
            <v-img
              width="50"
              height="50"
              class="rounded-xl"
              :src="user.picture"
            ></v-img>
            <v-btn
              v-if="user.mute"
              icon
              small
              elevation="2"
              class="white"
              style="position:absolute; right:-10px; bottom:0;"
              ><v-icon>mdi-microphone-off</v-icon></v-btn
            >
            <v-btn
              v-if="showDown(user.userId)"
              @click="downgrade(user.userId)"
              icon
              small
              elevation="2"
              class="white"
              style="position:absolute; right:-40px; bottom:0;"
              ><v-icon>mdi-arrow-down</v-icon></v-btn
            >
          </div>
          <div class="text--primary font-weight-bold">
            <v-icon
              v-if="isModerator(user.userId)"
              style="font-size:0.8em; padding:0.1em"
              class="green white--text rounded-xl mr-1"
              >mdi-asterisk</v-icon
            >{{ user.name }}
          </div>
        </div>
      </div>
      <template
        v-if="Object.keys(this.$store.state.myroom.listeners || {}).length > 0"
      >
        <div class="d-flex flex-wrap">
          Others in the room
        </div>
        <div class="d-flex flex-wrap">
          <div
            v-for="user in this.$store.state.myroom.listeners"
            :key="user.userId"
            class="d-flex flex-column align-center mb-4"
            style="width:33%"
          >
            <div style="position:relative">
              <v-img
                width="50"
                height="50"
                class="rounded-xl"
                :src="user.picture"
              ></v-img>
              <v-btn
                v-if="user.hand"
                icon
                small
                elevation="2"
                class="white"
                style="position:absolute; right:-10px; bottom:0; color:sandybrown;"
                ><v-icon>mdi-hand-left</v-icon></v-btn
              >
              <v-btn
                v-if="$store.getters.isModerator"
                @click="upgrade(user.userId)"
                icon
                small
                elevation="2"
                class="white"
                style="position:absolute; right:-40px; bottom:0;"
                ><v-icon>mdi-arrow-up</v-icon></v-btn
              >
            </div>
            <span class="text--primary font-weight-bold"
              ><v-icon
                v-if="isModerator(user.userId)"
                style="font-size:0.8em; padding:0.1em"
                class="green white--text rounded-xl mr-1"
                >mdi-asterisk</v-icon
              >{{ user.name }}</span
            >
          </div>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
import { UpgradeUser } from "@/plugins/firebase";

export default {
  methods: {
    upgrade: async function(userId) {
      await UpgradeUser({
        roomId: this.$store.state.myroom.roomId,
        userId,
        kind: "speaker",
      });
    },
    downgrade: async function(userId) {
      await UpgradeUser({
        roomId: this.$store.state.myroom.roomId,
        userId,
        kind: "listener",
      });
    },
    isModerator(userId) {
      return (this.$store.state.myroom?.moderators || []).includes(userId);
    },
    showDown(userId) {
      return (
        this.$store.getters.isModerator || userId === this.$store.state.myuid
      );
    },
  },
};
</script>
