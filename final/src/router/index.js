import { createRouter, createWebHistory } from "vue-router";

// login está en components
import LoginView from "../components/LoginView.vue";

// market está en views
import MarketView from "../views/Market.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginView },
  { path: "/market", component: MarketView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
≠