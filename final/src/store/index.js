import { createStore } from "vuex";

export default createStore({
  state() {
    return {
      userID: "",
      transactions: [],
      balances: {}, // Almacena el saldo de cada usuario
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

      // Cargar o inicializar saldo del usuario
      const balances = JSON.parse(localStorage.getItem("balances") || "{}");
      if (!balances[id]) {
        balances[id] = 565634343; // Saldo inicial predeterminado
        localStorage.setItem("balances", JSON.stringify(balances));
      }
      state.balances = balances;
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

      // Actualizar saldo del usuario
      const balances = JSON.parse(localStorage.getItem("balances") || "{}");
      if (!balances[state.userID]) {
        balances[state.userID] = 565634343;
      }

      // Restar si es compra, sumar si es venta
      if (transaction.type === "compra") {
        balances[state.userID] -= transaction.totalARS;
      } else if (transaction.type === "venta") {
        balances[state.userID] += transaction.totalARS;
      }

      state.balances = balances;
      localStorage.setItem("balances", JSON.stringify(balances));

      // Guarda todas las transacciones en localStorage de los usuarios
      const allTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]",
      );

      // Reemplazar la transacción si ya existe por id o agregarla
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

      // Encontrar la transacción para volver el saldo
      const transaction = state.transactions.find((tx) => tx.id === id);
      if (transaction) {
        const balances = JSON.parse(localStorage.getItem("balances") || "{}");

        if (transaction.type === "compra") {
          balances[state.userID] += transaction.totalARS;
        } else if (transaction.type === "venta") {
          balances[state.userID] -= transaction.totalARS;
        }
        state.balances = balances;
        localStorage.setItem("balances", JSON.stringify(balances));
      }

      state.transactions = state.transactions.filter((tx) => tx.id !== id);

      // Actualizar también en localStorage
      const allTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]",
      );
      const filtered = allTransactions.filter((tx) => tx.id !== id);
      localStorage.setItem("transactions", JSON.stringify(filtered));
    },


editTransaction(state, updatedTx) {
      const index = state.transactions.findIndex((t) => t.id === updatedTx.id);
      if (index !== -1) {
        const oldTx = state.transactions[index];
        const balances = JSON.parse(localStorage.getItem("balances") || "{}");

        // volver saldo a la transaccion anterior
        if (oldTx.type === "compra") {
          balances[state.userID] += oldTx.totalARS;
        } else if (oldTx.type === "venta") {
          balances[state.userID] -= oldTx.totalARS;
        }

        if (updatedTx.type === "compra") {
          balances[state.userID] -= updatedTx.totalARS;
        } else if (updatedTx.type === "venta") {
          balances[state.userID] += updatedTx.totalARS;
        }

        state.balances = balances;
        localStorage.setItem("balances", JSON.stringify(balances));

        // Actualizar el estado
        state.transactions.splice(index, 1, updatedTx);

        // Actualizar en ek localStorage
        const allTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
        const globalIndex = allTransactions.findIndex(t => t.id === updatedTx.id);
        if (globalIndex !== -1) {
          allTransactions[globalIndex] = updatedTx;
          localStorage.setItem("transactions", JSON.stringify(allTransactions));
        }
      }
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
    getCurrentUserBalance: (state) => {
      return state.balances[state.userID] || 565634343;
    },
    getCryptoBalances: (state) => {
      const balance = {};
      state.transactions.forEach(t => {
        if (!balance[t.crypto]) {
          balance[t.crypto] = 0;
        }
        if (t.type === "compra") {
          balance[t.crypto] += t.amount;
        } else {
          balance[t.crypto] -= t.amount;
        }
      });
      return balance;
    },
  },
});
