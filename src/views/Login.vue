<template>
  <v-container>
    <div id="firebaseui-auth-container"></div>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import firebaseui from "firebaseui-ja";
import "firebaseui-ja/dist/firebaseui.css";

export default {
  mounted() {
    const ui =
      firebaseui.auth.AuthUI.getInstance() ||
      new firebaseui.auth.AuthUI(firebase.auth());
    ui.start("#firebaseui-auth-container", {
      signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID,
      ],
      signInSuccessUrl: "/roomlist",
    });
  },
};
</script>
