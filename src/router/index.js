import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import { auth } from "@/plugins/firebase";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    meta: { requiresAuth: false },
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    meta: { requiresAuth: false },
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Login.vue"),
  },
  {
    path: "/logout",
    name: "Logout",
    meta: { requiresAuth: true },
    component: () =>
      import(/* webpackChunkName: "logout" */ "../views/Logout.vue"),
  },
  {
    path: "/activity",
    name: "Activity",
    meta: { requiresAuth: true },
    component: () =>
      import(/* webpackChunkName: "activity" */ "../views/Activity.vue"),
  },
  {
    path: "/explore",
    name: "Explore",
    meta: { requiresAuth: true },
    component: () =>
      import(/* webpackChunkName: "explore" */ "../views/Explore.vue"),
  },
  {
    path: "/invite",
    name: "Invite",
    meta: { requiresAuth: true },
    component: () =>
      import(/* webpackChunkName: "invite" */ "../views/Invite.vue"),
  },
  {
    path: "/profile",
    name: "Profile",
    meta: { requiresAuth: true },
    component: () =>
      import(/* webpackChunkName: "profile" */ "../views/Profile.vue"),
  },
  {
    path: "/room",
    name: "Room",
    meta: { requiresAuth: true },
    component: () => import(/* webpackChunkName: "room" */ "../views/Room.vue"),
  },
  {
    path: "/roomlist",
    name: "RoomList",
    meta: { requiresAuth: true },
    component: () =>
      import(/* webpackChunkName: "roomlist" */ "../views/RoomList.vue"),
  },
  {
    path: "/upcoming",
    name: "Upcoming",
    meta: { requiresAuth: true },
    component: () =>
      import(/* webpackChunkName: "upcoming" */ "../views/Upcoming.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (
    to.matched.some((record) => record.meta?.requiresAuth) &&
    !auth.currentUser
  ) {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (user) {
        next();
      } else {
        next({ name: "Login" });
      }
    });
    return;
  }
  next();
});

auth.onAuthStateChanged((user) => {
  const requiredAuth = router.currentRoute.matched.some(
    (record) => record.meta?.requiresAuth
  );
  if (requiredAuth && !user) {
    router.push({ name: "Home" });
  }
});

export default router;
