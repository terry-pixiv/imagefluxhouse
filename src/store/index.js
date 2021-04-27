import Vue from "vue";
import Vuex from "vuex";
import { ListRoom, SetMute, SetHand, db } from "@/plugins/firebase";
import { vuexfireMutations, firebaseAction } from "vuexfire";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    myuid: null,
    me: null,
    myroom: null,
    rooms: {},
    roomsCallback: {},
    mute: false,
    hand: false,
  },
  getters: {
    myname: (state) => {
      return state.me?.name || "";
    },
    mypicture: (state) => {
      return state.me?.picture || null;
    },
    myroomId: (state) => {
      return state.me?.roomId || null;
    },
    isModerator: (state) => {
      const ret = (state.myroom?.moderators || []).includes(state.myuid);
      return ret;
    },
    isSpeaker: (state) => {
      const ret = Object.keys(state.myroom?.speakers || {}).includes(
        state.myuid
      );
      return ret;
    },
    isListener: (state) => {
      const ret = Object.keys(state.myroom?.listeners || {}).includes(
        state.myuid
      );
      return ret;
    },
    mute: (state) => {
      return state.mute;
    },
    hand: (state) => {
      return state.hand;
    },
  },
  mutations: {
    myroom(state, val) {
      state.myroom = val;
    },
    rooms(state, val) {
      state.rooms = val;
    },
    toggleMute(state) {
      state.mute = !state.mute;
    },
    toggleHand(state) {
      state.hand = !state.hand;
    },
    ...vuexfireMutations,
  },
  actions: {
    onAuthStateChanged: firebaseAction((context, user) => {
      console.error("store onAuthStateChanged", user);
      const uid = user?.uid || null;
      context.state.myuid = uid;
      if (uid) {
        context.bindFirebaseRef("me", db.ref("users/" + uid));
      } else {
        context.unbindFirebaseRef("me");
      }
    }),
    myroom: firebaseAction((context) => {
      const myroomId = context.getters.myroomId;
      if (myroomId) {
        context.bindFirebaseRef("myroom", db.ref("rooms/" + myroomId));
      } else {
        context.unbindFirebaseRef("myroom");
      }
      context.dispatch("rooms");
    }),
    async rooms(context) {
      const val = (await ListRoom()).data || {};
      context.commit("rooms", val);
      Object.keys(val).forEach((roomId) => {
        if (!context.state.roomsCallback[roomId]) {
          context.state.roomsCallback[roomId] = (snapshot) => {
            const data = snapshot.val();
            if (data) {
              context.state.rooms[data.roomId] = data;
            } else {
              db.ref("rooms/" + roomId).off(
                "value",
                context.state.roomsCallback[roomId]
              );
              Vue.delete(context.state.roomsCallback, roomId);
              Vue.delete(context.state.rooms, roomId);
            }
          };
          db.ref("rooms/" + roomId).on(
            "value",
            context.state.roomsCallback[roomId]
          );
        }
      });
    },
    async toggleMute(context) {
      context.commit("toggleMute");
      const myroomId = context.getters.myroomId;
      if (myroomId) {
        await SetMute({ roomId: myroomId, mute: context.state.mute });
      }
    },
    async toggleHand(context) {
      context.commit("toggleHand");
      const myroomId = context.getters.myroomId;
      if (myroomId) {
        await SetHand({ roomId: myroomId, hand: context.state.hand });
      }
    },
  },
});

export default store;
