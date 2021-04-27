<template>
  <v-container>
    <v-row class="text-center">
      <v-col class="mb-4" cols="12"> </v-col>

      <v-col class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">
          Welcome to ImageFluxHouse
        </h1>

        <p class="subheading font-weight-regular">
          This is a sample application for ImageFlux LiveStreaming.
          <br />
          <a
            href="https://www.sakura.ad.jp/services/imageflux/livestreaming/"
            target="_blank"
            >please contact us</a
          >
        </p>

        <v-col class="mb-4" cols="12"> </v-col>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn to="/login" v-bind="attrs" v-on="on">
              <span class="mr-2">Login</span>
              <v-icon>mdi-login</v-icon>
            </v-btn>
          </template>
          <span>Login</span>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-container>
</template>
