import { createStore } from "vuex";

export default createStore({
  state() {
    return {
      userID: ""
    };
  },
  mutations: {
    setUser(state, id) {
      state.userID = id;
    }
  }
});

// axios se configuro en un servicio independiente para poder reutilizar la configuracion 
// en otros archivos, incluye la api key y manejo de sesion con jwt
