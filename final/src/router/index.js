import { createRouter, createWebHistory } from "vue-router";

// login está en components
import LoginView from "../components/LoginView.vue";

// market está en views
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
