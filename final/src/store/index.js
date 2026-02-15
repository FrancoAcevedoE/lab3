import { createStore } from "vuex";

export default createStore({
  state() {
    return {
      userID: "",
      transactions: []
    };
  },
  mutations: {
    setUser(state, id) {
      state.userID = id;
    },
    addTransaction(state, transaction) {
      state.transactions.push(transaction);
    },
    deleteTransaction(state, id) {
      state.transactions = state.transactions.filter(tx => tx.id !== id);
    },
    setTransactions(state, transactions) {
      state.transactions = transactions;
    }
  },
  getters: {
    getTransactions: (state) => state.transactions,
    getTransactionById: (state) => (id) => {
      return state.transactions.find(tx => tx.id === id);
    }
  }
});

// axios se configuro en un servicio independiente para poder reutilizar la configuracion 
// en otros archivos, incluye la api key y manejo de sesion con jwt
