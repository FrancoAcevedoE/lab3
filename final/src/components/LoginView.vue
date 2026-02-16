<template>
  <div class="page">
    <div class="title">
      <img src="../assets/logo.png" alt="Logo" class="logo" />YOUWALLET
    </div>
    <div class="box">
      <h1>Your acount</h1>
      <form action="submit">
        <p>user ID</p>

        <div class="input-wrapper">
          <input
            type="text"
            v-model="user.userID"
            placeholder="please join user ID"
          />
          <span class="tooltip">
            Máximo 8 caracteres<br />
            Solo letras y números
          </span>
        </div>

        <p>password</p>
        <div class="input-wrapper">
          <input
            type="text"
            v-model="user.password"
            id="password"
            placeholder="please join password"
          />
          <span class="tooltip">
            Solo números<br />
            Exactamente 4 dígitos
          </span>
        </div>
        <br /><br />
        <input type="submit" value="Login" @click.prevent="login" class="button"/>
      </form>
    </div>
  </div>

  <footer>
    <p style="text-align: center; margin-top: 20px">
      &copy; 2024 YouWallet. All rights reserved.
    </p>
  </footer>
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
        // alert("please enter user ID");
        return;
      }

      if (!this.user.password) {
        // alert("please enter password");
        return;
      }

      if (!alphaNumeric.test(this.user.userID)) {
        // alert("user ID must contain only letters and numbers");
        return;
      }

      if (!onlyNumbers.test(this.user.password)) {
        // alert("password must contain only numbers");
        return;
      }
      if (this.user.password.length !== 4) {
        // alert("password must be exactly 4 digits");
        return;
      }

      // guarda en Vuex
      this.$store.commit("setUser", this.user.userID);
      // alert("login successful");
      console.log(this.$store);
      // redirigir a la vista principal una vez autenticado
      this.$router.push('/market');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import "../assets/main.css";
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
p {
  font-size: 1.2rem;
  color: #828282;
  margin-bottom: 1px
}
/* logo y titulo */
.logo {
  width: 130px;
  height: 130px;
  vertical-align: middle;
}
.title {
  font-size: 3.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}
/* form */

.tooltip {
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #dadada;
  color: #2d2d2d;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

</style>
