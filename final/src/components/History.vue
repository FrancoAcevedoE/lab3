<template>
  <div class="history-view">
    <h1>HISTORY</h1>
    <table border="1" v-if="transactions.length > 0">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Crypto</th>
          <th>Cantidad</th>
          <th>Precio</th>
          <th>Total ARS</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tx in transactions" :key="tx.id">
          <td>{{ tx.type }}</td>
          <td>{{ tx.crypto }}</td>
          <td>{{ tx.amount }}</td>
          <td>${{ tx.price }}</td>
          <td>${{ tx.totalARS }}</td>
          <td>{{ tx.date }}</td>
          <td>
            <button @click="deleteTransaction(tx.id)">Eliminar</button>
            <button @click="editTx(tx)">Editar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>No hay transacciones registradas</p>
  </div>
</template>

<script>
export default {
  name: "RegistedTransactions",
  props: {
    userID: {
      type: String,
      required: true,
    },
  },
  computed: {
    transactions() {
      return this.$store.getters.getTransactions;
    }
  },
  methods: {
    deleteTransaction(id) {
      this.$store.commit('deleteTransaction', id);
    },
    editTx(tx) {
      console.log("Editing transaction", tx);
      // Lógica para editar una transacción (puede abrir un modal o redirigir a otra vista)
    },
  },
};
</script>
