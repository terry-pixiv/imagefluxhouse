<template>
  <v-container>
    <v-skeleton-loader
      v-if="Object.keys($store.state.rooms || {}).length == 0"
      elevation="2"
      class="rounded-xl mb-4"
      type="list-item, list-item-avatar-three-line, list-item-avatar-three-line"
    >
    </v-skeleton-loader>

    <v-card
      @click="joinRoom(room)"
      elevation="2"
      class="rounded-xl mb-4"
      v-for="room in $store.state.rooms"
      :key="room.roomId"
    >
      <v-card-text>
        <div class="text--primary font-weight-bold pb-2">{{ room.name }}</div>
        <div class="d-flex">
          <div class="pr-4">
            <v-img
              width="50"
              height="50"
              class="rounded-xl"
              v-if="(room.pictures || []).length > 0"
              :src="room.pictures[0]"
            ></v-img>
            <v-img
              width="50"
              height="50"
              class="rounded-xl"
              v-if="(room.pictures || []).length > 1"
              :src="room.pictures[1]"
            ></v-img>
          </div>
          <div>
            <div v-for="user in room.speakers" :key="user.userId">
              <span class="text--primary font-weight-bold">{{
                user.name
              }}</span>
              &nbsp;<v-icon small>mdi-chat-processing-outline</v-icon>
            </div>
            <div>
              {{
                Object.keys(room.listeners || {}).length +
                  Object.keys(room.speakers || {}).length
              }}
              <v-icon small>mdi-account</v-icon> /
              {{ Object.keys(room.speakers || {}).length }}
              <v-icon small>mdi-chat-processing</v-icon>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <div style="height:150px;"></div>
  </v-container>
</template>

<script>
import { JoinRoom } from "@/plugins/firebase";

export default {
  async mounted() {
    this.$store.dispatch("rooms");
  },

  methods: {
    async joinRoom(room) {
      await JoinRoom({ roomId: room.roomId });
      this.$router.push({ name: "Room" });
    },
  },
};
</script>
