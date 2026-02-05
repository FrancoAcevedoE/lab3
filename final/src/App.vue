<template>
  <div id="app">
<LoginView @login-success="setUserID" />
<DashboardView :userID="userID" />
  </div>
</template>

<script>
import LoginView from './components/LoginView.vue';
import DashboardView from './components/DashboardView.vue';


export default {
  name: 'App',
  components: {
    LoginView,
    DashboardView,
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
