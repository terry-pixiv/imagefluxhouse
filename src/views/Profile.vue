<template>
  <v-container>
    <h1>Profile page</h1>
    <div>uid: {{ $store.state.myuid }}</div>
    <div>name: {{ $store.getters.myname }}</div>
  </v-container>
</template>
