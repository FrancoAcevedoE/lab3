<template>
  <div>
    <div
      class="log">
      <h1>Create acount</h1>
      <form action="submit">
        <p>user ID</p>
        <p>this username only content until 8 letters</p>
        <input
          type="text"
          v-model="user.userID"
          placeholder="please join user ID"
        />
        <p>password</p>
        <p>this password only content numbers the 4 digit</p>
        <input
          type="text"
          v-model="user.password"
          id="password"
          placeholder="please join password"
        />
        <br /><br />
        <input type="submit" value="Login" @click.prevent="login" />
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginView",
  data() {
    return {
      user: {
        userID: "",
        password: "",
      },
    };
  },

  methods: {
    login() {
      const alphaNumeric = /^[A-Za-z0-9]+$/;
      const onlyNumbers = /^[0-9]+$/;

      if (!this.user.userID && !this.user.password) {
        alert("please complete all fields");
        return;
      }

      if (!this.user.userID) {
        alert("please enter user ID");
        return;
      }

      if (!this.user.password) {
        alert("please enter password");
        return;
      }

      if (!alphaNumeric.test(this.user.userID)) {
        alert("user ID must contain only letters and numbers");
        return;
      }

      if (!onlyNumbers.test(this.user.password)) {
        alert("password must contain only numbers");
        return;
      }

      // guarda en Vuex
      this.$store.commit("setUser", this.user.userID);

      alert("login successful");
      console.log(this.$store);
    },
  },
};
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.log {
  border: 2px solid black;
  width: 400px;
  margin: auto;
  padding: 20px;
  text-align: left;
}
</style>
