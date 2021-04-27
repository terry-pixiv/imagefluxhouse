<template>
  <v-footer
    fixed
    padless
    color="transparent"
    class="d-flex flex-column align-stretch"
  >
    <v-sheet id="footer1" v-if="isRoomList" class="d-flex justify-center">
      <div style="width:48px"></div>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            @click="createRoom"
            color="#43A047"
            class="white--text rounded-pill font-weight-bold text-capitalize"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-plus</v-icon><span>Start a room</span>
          </v-btn>
        </template>
        <span>Start a room</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            color="transparent"
            class="grey--text text--darken-4 rounded-pill"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-dots-grid</v-icon>
          </v-btn>
        </template>
        <span>Available to Chat</span>
      </v-tooltip>
    </v-sheet>
    <v-sheet id="footer2" class="pt-4">
      <v-sheet
        elevation="2"
        class="rounded-t-xl d-flex pa-4"
        v-if="$store.state.myroom"
      >
        <template v-if="!isRoom">
          <v-img
            max-width="40"
            max-height="40"
            width="40"
            height="40"
            class="rounded-circle"
            v-if="($store.state.myroom.pictures || []).length > 0"
            :src="$store.state.myroom.pictures[0]"
          ></v-img>
          <v-img
            max-width="40"
            max-height="40"
            width="40"
            height="40"
            class="rounded-circle"
            v-if="($store.state.myroom.pictures || []).length > 1"
            :src="$store.state.myroom.pictures[1]"
          ></v-img>
          <v-btn
            icon
            large
            class="grey--text text--darken-4 grey lighten-3"
            v-if="userCountMinus2 > 0"
          >
            +{{ userCountMinus2 }}
          </v-btn>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                @click="leaveRoom"
                icon
                large
                class="grey--text text--darken-4 grey lighten-3 ml-auto"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-hand-peace</v-icon>
              </v-btn>
            </template>
            <span>Leave</span>
          </v-tooltip>
        </template>
        <template v-if="isRoom">
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                @click="leaveRoom"
                rounded
                depressed
                large
                class="red--text text--darken-4 grey lighten-3 mr-auto"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-hand-peace</v-icon>Leave
              </v-btn>
            </template>
            <span>Leave</span>
          </v-tooltip>
        </template>
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              @click="invite"
              icon
              large
              class="grey--text text--darken-4 grey lighten-3 ml-4"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </template>
          <span>Ping</span>
        </v-tooltip>
        <v-tooltip top v-if="$store.getters.isListener">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              @click="toggleHand"
              icon
              large
              class="grey--text text--darken-4 grey lighten-3 ml-4"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-hand-left</v-icon>
            </v-btn>
          </template>
          <span>Hands</span>
        </v-tooltip>
        <v-tooltip top v-if="$store.getters.isSpeaker">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              @click="toggleMute"
              icon
              large
              class="grey--text text--darken-4 grey lighten-3 ml-4"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon v-if="$store.getters.mute">mdi-microphone-off</v-icon>
              <v-icon v-else>mdi-microphone</v-icon>
            </v-btn>
          </template>
          <span>Mute</span>
        </v-tooltip>
      </v-sheet>
      <v-sheet class="pt-12" color="transparent" v-else> </v-sheet>
    </v-sheet>
  </v-footer>
</template>

<script>
import { CreateRoom, LeaveRoom } from "@/plugins/firebase";

export default {
  computed: {
    userCountMinus2() {
      return (
        Object.keys(this.$store.state.myroom.listeners || {}).length +
        Object.keys(this.$store.state.myroom.speakers || {}).length -
        (this.$store.state.myroom.pictures || []).length
      );
    },
    isRoomList() {
      return this.$route.name === "RoomList";
    },
    isRoom() {
      return this.$route.name === "Room";
    },
  },

  methods: {
    leaveRoom: async function() {
      await LeaveRoom({ roomId: this.$store.state.myroom.roomId });
      if (this.$route.name === "Room") {
        this.$router.push({ name: "RoomList" });
      }
    },
    toggleHand: async function() {
      this.$store.dispatch("toggleHand");
    },
    toggleMute: async function() {
      this.$store.dispatch("toggleMute");
    },
    invite: async function() {},
    createRoom: async function() {
      if (this.$store.state.myroom) {
        // FIXME 確認ダイアログ表示
        await LeaveRoom({ roomId: this.$store.state.myroom.roomId });
        await CreateRoom();
      } else {
        await CreateRoom();
      }
      this.$router.push({ name: "Room" });
    },
  },
};
</script>

<style scoped>
#footer1 {
  background-color: var(--v-background-base) !important;
  background: linear-gradient(transparent, var(--v-background-base)) !important;
}
#footer2 {
  background-color: var(--v-background-base) !important;
}
</style>
