<template>
  <div id="app">
    <nav>
      <template v-if="!isAuthenticated"> </template>
      <template v-else>
        <router-link to="/market" class="router">Market</router-link>
        <router-link to="/history" class="router">History</router-link>
        <button @click="logout" class="logout-button">Cerrar sesión</button>
      </template>
    </nav>

    <LoginView v-if="!isAuthenticated" />
    <router-view v-else />
  </div>
</template>

<script>
import LoginView from "./components/LoginView.vue";

export default {
  name: "App",
  components: {
    LoginView,
  },
  mounted() {
    const savedUserID = localStorage.getItem("userID");
    if (savedUserID) {
      this.$store.commit("setUser", savedUserID);
    }
  },
  computed: {
    isAuthenticated() {
      return !!this.$store.state.userID;
    },
  },
  methods: {
    logout() {
      this.$store.commit("logout");
      localStorage.removeItem("userID");
      this.$router.push("/login");
    },
  },
};
</script>

<style>
@import "./assets/main.css";
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

nav {
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

.router {
  display: inline-block;
  padding: 10px 15px !important;
  margin: 5px !important;
  text-decoration: none;
  color: #ffffff;
  border: 1px solid #c1c1c1;
  border-radius: 2rem;
  background-color: rgb(152, 148, 148);
  cursor: pointer;
  transition: box-shadow 0.3s ease;
}

.router:hover {
  box-shadow: 0px 0px 5px 0px rgb(74, 74, 74);
}

.logout-button {
  padding: 10px 15px;
  margin: 5px;
  background-color: rgb(238, 238, 238);
  color: #2d2d2d;
  border: 1px solid #ccc;
  border-radius: 2rem;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
}

.logout-button:hover {
  box-shadow: 0px 0px 5px 0px rgb(74, 74, 74);
}
</style>
