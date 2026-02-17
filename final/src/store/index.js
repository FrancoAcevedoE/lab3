import { createStore } from "vuex";

export default createStore({
  state() {
    return {
      userID: "",
      transactions: [],
      authState: {
        isAuthenticated: false,
       }
    };
  },
  actions: {
    login({ commit }, userID) {
      commit('setUser', userID);
    },
    logout({ commit }) {
      commit('logout');
    }
  },
  mutations: {
    setUser(state, id) {
      state.userID = id;
      state.authState.isAuthenticated = true;
    },
    logout(state) {
      state.userID = "";
      state.transactions = [];
      state.authState.isAuthenticated = false;
      state.authState.token = null;
      state.authState.user = null;
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


