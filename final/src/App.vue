<template>
  <div id="app">
<LoginView @login-success="setUserID" />
<DashboardView :userID="userID" />
<CompraVenta />
  </div>
</template>

<script>
import LoginView from './components/LoginView.vue';
import DashboardView from './components/DashboardView.vue';
import CompraVenta from './components/CompraVenta.vue';


export default {
  name: 'App',
  components: {
    LoginView,
    DashboardView,
    CompraVenta,
  },

  data() {
    return {
      userID: ""
    }
  },
  methods: {
    setUserID(id) {
      this.userID = id
    }
  }
}
</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
