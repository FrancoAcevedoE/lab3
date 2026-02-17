<template>
  <div class="page">
    <div class="title">
      <img src="../assets/logo.png" alt="Logo" class="logo" />YOUWALLET
    </div>
    <div class="box">
      <h1>Your Account</h1>
      <form @submit.prevent="login">
        <label for="userID">User ID</label>
        <div class="input-wrapper">
          <input
            type="text"
            id="userID"
            v-model="user.userID"
            placeholder="Enter User ID"
            autocomplete="username"
          />
          <span class="tooltip">
            Máximo 8 caracteres<br />
            Solo letras y números
          </span>
        </div>

        <label for="password">Password</label>
        <div class="input-wrapper">
          <input
            type="password"
            v-model="user.password"
            id="password"
            placeholder="Enter Password"
            inputmode="numeric"
            autocomplete="current-password"
          />
          <span class="tooltip">
            Solo números<br />
            Exactamente 4 dígitos
          </span>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <br /><br />
        <button type="submit" class="button login-button">Login</button>
      </form>
    </div>
  </div>

  <footer>
    <p style="text-align: center; margin-top: 20px">
      &copy; {{ new Date().getFullYear() }} YouWallet. All rights reserved.
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
      errorMessage: "",
    };
  },
  mounted() {
    if (this.$store.state.userID) {
      this.$router.push("/market");
    }
  },

  methods: {
    login() {
      this.errorMessage = "";
      const alphaNumeric = /^[A-Za-z0-9]+$/;
      const onlyNumbers = /^[0-9]+$/;

      if (!this.user.userID && !this.user.password) {
        this.errorMessage = "Por favor complete los campos";
        return;
      }

      if (!this.user.userID) {
        this.errorMessage = "Por favor ingrese el usuario";
        return;
      }

      if (!this.user.password) {
        this.errorMessage = "Por favor ingrese la contraseña";
        return;
      }

      if (!alphaNumeric.test(this.user.userID)) {
        this.errorMessage = "El usuario puede contar solo con letras y números";
        return;
      }

      if (!onlyNumbers.test(this.user.password)) {
        this.errorMessage = "La contraseña solo pueden ser números";
        return;
      }
      if (this.user.password.length !== 4) {
        this.errorMessage = "La contraseña debe tener exactamente 4 dígitos";
        return;
      }
      // guarda en Vuex y localStorage
      this.$store.commit("setUser", this.user.userID);
      localStorage.setItem("userID", this.user.userID);
      console.log(this.$store);
      this.$router.push("/market");
    },
  }
};
</script>

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
  margin-bottom: 1px;
}

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
.error-message {
  color: #d9534f;
  margin-top: 10px;
  font-weight: bold;
  text-align: center;
}

label {
  display: block;
  text-align: left;
  margin-bottom: 5px;
  color: #555;
  font-weight: bold;
}
</style>
