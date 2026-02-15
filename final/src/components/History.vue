<template>
<div class="history-view">
    <h1>HISTORY</h1>
    <tr v-for="tx in transactions" :key="tx.id">
        <td>{{ tx.type }}</td>
        <td>{{ tx.crypto }}</td>
        <td>{{ tx.amount }}</td>
        <td>{{ tx.price }}</td>
        <td>{{ tx.date }}</td>
        <button @click="deleteTransaction(tx.id)">Eliminar</button>
        <button @click="editTx(tx)">editar</button>
    </tr>
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
    data() {
     
    },
    // mounted() {
    //     this.loadTransactions();
    // },
    // methods: {
    //     loadTransactions() {
    //         // Lógica para cargar las transacciones del usuario desde la API
    //     },
    //     deleteTransaction(id) {
    //         // Lógica para eliminar una transacción por su ID
    //     },
    //     editTx(tx) {
    //         // Lógica para editar una transacción (puede abrir un modal o redirigir a otra vista)
    //     },
    // },
};
</script>