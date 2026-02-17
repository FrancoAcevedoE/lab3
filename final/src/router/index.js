import { createRouter, createWebHistory } from "vue-router";

import LoginView from "../components/LoginView.vue";

import MarketView from "../views/Market.vue";

import HistoryView from "../views/HistoryView.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginView },
  { path: "/market", component: MarketView },
  { path: "/history", component: HistoryView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
