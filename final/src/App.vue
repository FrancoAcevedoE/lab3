<template>
  <div id="app">
    <nav>
      <template v-if="!isAuthenticated">
        <!-- Cuando no está autenticado, no mostramos router-links de la app -->
      </template>
      <template v-else>
        <router-link to="/market">Market</router-link>
        <router-link to="/history">History</router-link>
        <button @click="logout" class="logout-button">Cerrar sesión</button>
      </template>
    </nav>

    <!-- Si no está autenticado renderizamos el componente de Login directamente
         para evitar que `router-view` cargue otras rutas; una vez autenticado
         usamos `router-view` normalmente -->
    <LoginView v-if="!isAuthenticated" />
    <router-view v-else />
  </div>
</template>

<script>
import LoginView from './components/LoginView.vue'

export default {
  name: 'App',
  components: {
    LoginView
  },
  computed: {
    isAuthenticated() {
      return !!this.$store.state.userID;
    }
  },
  methods: {
    logout() {
      this.$store.commit('logout');
      this.$router.push('/login');
    }
  }
}
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
</style>
