<template>
  <v-app-bar app elevation="0" dense>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn to="/explore" text v-bind="attrs" v-on="on">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </template>
      <span>Explore</span>
    </v-tooltip>
    <v-spacer></v-spacer>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn to="/roomlist" text v-bind="attrs" v-on="on">
          <v-icon>mdi-home-account</v-icon>
        </v-btn>
      </template>
      <span>RoomList</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn to="/invite" text v-bind="attrs" v-on="on">
          <v-icon>mdi-email-open</v-icon>
        </v-btn>
      </template>
      <span>Invite</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn to="/upcoming" text v-bind="attrs" v-on="on">
          <v-icon>mdi-calendar-month-outline</v-icon>
        </v-btn>
      </template>
      <span>Upcoming</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn to="/activity" text v-bind="attrs" v-on="on">
          <v-icon>mdi-bell-outline</v-icon>
        </v-btn>
      </template>
      <span>Activity</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn to="/profile" text v-bind="attrs" v-on="on">
          <v-img
            width="32"
            height="32"
            class="rounded-circle"
            v-if="$store.getters.mypicture"
            :src="$store.getters.mypicture"
          ></v-img>
        </v-btn>
      </template>
      <span>Profile</span>
    </v-tooltip>
    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn to="/logout" text v-bind="attrs" v-on="on">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </template>
      <span>Logout</span>
    </v-tooltip>
  </v-app-bar>
</template>

<style scoped>
.v-app-bar {
  background-color: var(--v-background-base) !important;
}
</style>
