import { createStore } from "vuex";

export default createStore({
  state() {
    return {
      userID: "",
      transactions: [],
      authState: {
        isAuthenticated: false,
      },
    };
  },
  actions: {
    login({ commit }, userID) {
      commit("setUser", userID);
    },
    logout({ commit }) {
      commit("logout");
    },
  },
  mutations: {
    setUser(state, id) {
      state.userID = id;
      state.authState.isAuthenticated = true;

      // Cargar solo las transacciones del usuario
      const allTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]",
      );
      state.transactions = allTransactions.filter((tx) => tx.userID === id);
    },
    //al salir pone todo en 0
    logout(state) {
      state.userID = "";
      state.transactions = [];
      state.authState.isAuthenticated = false;
      state.authState.token = null;
      state.authState.user = null;
    },
    addTransaction(state, transaction) {
      // Generar ID único si no existe
      if (!transaction.id) {
        transaction.id = `${state.userID}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
      }
      state.transactions.push(transaction);

      // Guarda todas las transacciones en localStorage de los usuarios
      const allTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]",
      );

      // Reemplazar la transacción si ya existe (por id) o agregarla
      const existingIndex = allTransactions.findIndex(
        (t) => t.id === transaction.id,
      );
      if (existingIndex >= 0) {
        allTransactions[existingIndex] = transaction;
      } else {
        allTransactions.push(transaction);
      }
      localStorage.setItem("transactions", JSON.stringify(allTransactions));
    },
    deleteTransaction(state, id) {
      state.transactions = state.transactions.filter((tx) => tx.id !== id);

      // Actualizar también en localStorage
      const allTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]",
      );
      const filtered = allTransactions.filter((tx) => tx.id !== id);
      localStorage.setItem("transactions", JSON.stringify(filtered));
    },
    setTransactions(state, transactions) {
      state.transactions = transactions;
    },
  },
  getters: {
    getTransactions: (state) => state.transactions,
    getTransactionById: (state) => (id) => {
      return state.transactions.find((tx) => tx.id === id);
    },
  },
});
