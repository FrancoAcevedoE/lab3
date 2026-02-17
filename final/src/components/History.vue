<template>
  <div class="history-view">
    <h1>HISTORY</h1>
    <!-- esta parte es el balance de saldos y cryptos -->
    <div class="balance-display">
      <p>Saldo Disponible: <strong>${{ formattedBalance }}</strong> ARS</p>
    </div>
    <div class="crypto-balance-display" v-if="Object.keys(filteredCryptoBalance).length > 0">
      <p>Saldo de Cryptos:</p>
      <div class="crypto-list">
        <div class="crypto-item" v-for="(amount, crypto) in filteredCryptoBalance" :key="crypto">
          <span class="crypto-name">{{ crypto }}:</span>
          <span class="crypto-amount">{{ amount.toFixed(8) }}</span>
        </div>
      </div>
    </div>
    <div class="content-wrapper">
      <div class="table-section">
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
              <template v-if="editingId === tx.id">
                 <td>{{ tx.type }}</td>
                 <td>{{ tx.crypto }}</td>
                 <td>
                    <input type="number" v-model.number="editForm.amount" step="any" class="edit-input">
                 </td>
                 <td>${{ Number(tx.price).toLocaleString('es-AR') }}</td>
                 <td>
                    <input type="number" v-model.number="editForm.totalARS" step="any" class="edit-input">
                 </td>
                 <td>{{ tx.date }}</td>
                 <td class="actions-cell">
                    <button @click="saveEdit(tx)" class="btn-save">Guardar</button>
                    <button @click="cancelEdit" class="btn-cancel">Cancelar</button>
                 </td>
              </template>
              <template v-else>
                  <td>{{ tx.type }}</td>
                  <td>{{ tx.crypto }}</td>
                  <td>{{ tx.amount }}</td>
                  <td>${{ Number(tx.price).toLocaleString('es-AR') }}</td>
                  <td>${{ Number(tx.totalARS).toLocaleString('es-AR') }}</td>
                  <td>{{ tx.date }}</td>
                  <td class="actions-cell">
                    <button @click="editTx(tx)" class="btn-edit">Editar</button>
                    <button @click="deleteTransaction(tx.id)" class="btn-delete">Eliminar</button>
                  </td>
              </template>
            </tr>
          </tbody>
        </table>
        <p v-else>No hay transacciones registradas</p>
      </div>

      <!-- chart es la libreria gráficos -->
      <div class="charts-section" v-if="transactions.length">
        <div class="charts">
          <div class="chart-container" v-if="Object.keys(buyData).length > 0">
            <canvas ref="buyChart"></canvas>
          </div>
          <div class="chart-container" v-if="Object.keys(sellData).length > 0">
            <canvas ref="sellChart"></canvas>
          </div>
          <div class="chart-container">
            <canvas ref="balanceChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Chart from "chart.js/auto";

export default {
  name: "RegistedTransactions",
  props: {
    userID: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      chartInstances: [],
      editingId: null,
      editForm: {
        amount: 0,
        totalARS: 0
      }
    };
  },
  computed: {
    transactions() {
      return this.$store.getters.getTransactions;
    },    
    formattedBalance() {
      const balance = this.$store.getters.getCurrentUserBalance;
      return balance.toLocaleString('es-AR');
    },    // esto es el grafico
    buyData() {
      const result = {};
      this.transactions.filter(t => t.type === "compra").forEach(t => {
        result[t.crypto] = (result[t.crypto] || 0) + t.totalARS;
      });
      return result;
    },
    sellData() {
      const result = {};
      this.transactions
        .filter(t => t.type === "venta")
        .forEach(t => {
          result[t.crypto] = (result[t.crypto] || 0) + t.totalARS;
        });
      return result;
    },
    balanceData() {
      let invested = 0;
      let realized = 0;

      this.transactions.forEach(t => {
        if (t.type === "compra") invested += t.totalARS;
        else realized += t.totalARS;
      });

      return { invested, realized };
    },
    cryptoBalance() {
      const balance = {};
      this.transactions.forEach(t => {
        if (!balance[t.crypto]) {
          balance[t.crypto] = { comprada: 0, vendida: 0 };
        }
        if (t.type === "compra") {
          balance[t.crypto].comprada += t.amount;
        } else {
          balance[t.crypto].vendida += t.amount;
        }
      });
      
      // Calcular saldo final de cada crypto
      const resultado = {};
      Object.keys(balance).forEach(crypto => {
        resultado[crypto] = balance[crypto].comprada - balance[crypto].vendida;
      });
      return resultado;
    },
    filteredCryptoBalance() {
      const filtered = {};
      Object.keys(this.cryptoBalance).forEach(crypto => {
        if (this.cryptoBalance[crypto] > 0) {
          filtered[crypto] = this.cryptoBalance[crypto];
        }
      });
      return filtered;
    }
  },
  mounted() {
    // Renderizar gráficos cuando el componente se monta
    this.$nextTick(() => {
      if (this.transactions.length > 0) {
        this.renderCharts();
      }
    });
  },
  watch: {
    transactions(newVal) {
      // Renderizar gráficos cuando cambien las transacciones
      if (newVal.length > 0) {
        this.$nextTick(() => {
          this.destroyCharts();
          this.renderCharts();
        });
      }
    }
  },
  beforeUnmount() {
    // Destruir instancias de Chart al desmontar el componente
    this.destroyCharts();
  },
  methods: {
    // creacion de los graficos
    renderCharts() {
      this.renderPie(this.$refs.buyChart, "Compras por Crypto", this.buyData);
      this.renderPie(this.$refs.sellChart, "Ventas por Crypto", this.sellData);
      this.renderBalance();
    },
    destroyCharts() {
      this.chartInstances.forEach(chart => {
        if (chart) {
          chart.destroy();
        }
      });
      this.chartInstances = [];
    },
    renderPie(canvas, title, dataObj) {
      if (!canvas) return;

      // Si no hay datos, no crear gráfico
      if (Object.keys(dataObj).length === 0) return;

      const chart = new Chart(canvas, {
        type: "pie",
        data: {
          labels: Object.keys(dataObj),
          datasets: [
            {
              data: Object.values(dataObj),
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40'
              ]
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: title,
              font: {
                size: 14
              }
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      });
      this.chartInstances.push(chart);
    },
    //balance de saldos con los graficos libreria chart
    renderBalance() {
      const balanceCanvas = this.$refs.balanceChart;
      if (!balanceCanvas) return;

      const chart = new Chart(balanceCanvas, {
        type: "doughnut",
        data: {
          labels: ["Invertido", "Realizado"],
          datasets: [
            {
              data: [
                this.balanceData.invested,
                this.balanceData.realized
              ],
              backgroundColor: [
                '#36A2EB',
                '#FF6384'
              ]
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Composición del saldo",
              font: {
                size: 14
              }
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      });
      this.chartInstances.push(chart);
    },

    deleteTransaction(id) {
       if(confirm("¿Estás seguro de que deseas eliminar esta transacción?")) {
          this.$store.commit("deleteTransaction", id);
       }
    },
    editTx(tx) {
      this.editingId = tx.id;
      this.editForm.amount = tx.amount;
      this.editForm.totalARS = tx.totalARS;
    },
    cancelEdit() {
      this.editingId = null;
      this.editForm.amount = 0;
      this.editForm.totalARS = 0;
    },
    saveEdit(tx) {
      if (this.editForm.amount <= 0 || this.editForm.totalARS <= 0) {
        // En un caso real usaría una notificación mejor, pero para mantener simple
        // solo evitamos el guardado si es inválido.
        alert("La cantidad y el total deben ser mayores a 0");
        return;
      }

      const updatedTx = {
         ...tx,
         amount: this.editForm.amount,
         totalARS: this.editForm.totalARS,
         // Recalcular precio unitario implicito para consistencia
         price: this.editForm.totalARS / this.editForm.amount 
      };

      this.$store.commit("editTransaction", updatedTx);
      this.cancelEdit();
    },
  },
};
</script>

<style scoped>
.history-view {
  padding: 15px;
  max-width: 1600px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin: 0 0 20px 0;
  color: #333;
  font-size: 2rem;
}

.balance-display {
  background-color: #f0f0f0;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
}

.balance-display p {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.balance-display strong {
  color: #2d7a3e;
  font-size: 1.2rem;
}

.crypto-balance-display {
  background-color: #e8f5e9;
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.crypto-balance-display p {
  margin: 0 0 10px 0;
  font-size: 1rem;
  color: #333;
  font-weight: bold;
}

.crypto-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.crypto-item {
  background-color: white;
  border: 1px solid #4caf50;
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.crypto-name {
  color: #2d7a3e;
  font-weight: bold;
  min-width: 60px;
}

.crypto-amount {
  color: #333;
  font-family: monospace;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
  align-items: start;
}

.table-section {
  overflow-x: auto;
}

.charts-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

thead {
  background-color: #f5f5f5;
  font-weight: bold;
}

th, td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #ddd;
  font-size: 0.95rem;
}

tbody tr:hover {
  background-color: #f9f9f9;
}

button {
  padding: 6px 10px;
  margin: 2px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  background-color: #f0f0f0;
  transition: all 0.3s ease;
  font-size: 0.85rem;
}

button:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

button:active {
  transform: scale(0.98);
}
.actions-cell {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.btn-edit, .btn-save {
    background-color: #2d7a3e;
    color: white;
    border: none;
}
.btn-edit:hover, .btn-save:hover {
    background-color: #236832;
}

.btn-delete, .btn-cancel {
    background-color: #d9534f;
    color: white;
    border: none;
}
.btn-delete:hover, .btn-cancel:hover {
    background-color: #c9302c;
}

.edit-input {
    width: 80px;
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

p {
  text-align: center;
  color: #999;
  padding: 30px 20px;
  font-size: 1.1rem;
}

.charts {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chart-container {
  background-color: rgb(255, 255, 255);
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 300px;
  height: 300px;
  overflow: hidden;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
  max-width: 100%;
}
@media (max-width: 1200px) {
  .history-view {
    padding: 12px;
  }

  h1 {
    font-size: 1.7rem;
    margin-bottom: 15px;
  }

  .content-wrapper {
    grid-template-columns: 1.1fr 1fr;
    gap: 15px;
  }

  table, th, td {
    font-size: 0.9rem;
  }

  th, td {
    padding: 8px;
  }
  .chart-container {
    width: 100px;
    height: 100px;
    padding: 8px;
  }
}

@media (max-width: 1024px) {
  .history-view {
    padding: 10px;
  }

  h1 {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }

  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  table {
    font-size: 0.85rem;
  }

  th, td {
    padding: 7px;
  }

  button {
    padding: 5px 8px;
    font-size: 0.8rem;
  }

  .charts {
    gap: 15px;
  }

  .chart-container {
    width: 200px;
    height: 200px;
    padding: 8px;
  }
}

@media (max-width: 768px) {
  .history-view {
    padding: 8px;
  }

  h1 {
    font-size: 1.3rem;
    margin-bottom: 12px;
  }

  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  table {
    font-size: 0.8rem;
  }

  th, td {
    padding: 6px 4px;
  }

  button {
    padding: 5px 8px;
    margin: 1px;
    font-size: 0.75rem;
  }

  .charts {
    gap: 12px;
  }

  .chart-container {
    width: 200px;
    height: 200px;
    padding: 6px;
  }
}

@media (max-width: 600px) {
  .history-view {
    display: grid;
    padding: 6px;
    justify-items: center;
  }

  h1 {
    font-size: 1.1rem;
    margin-bottom: 10px;
  }

  .crypto-list {
    gap: 8px;
  }

  .crypto-item {
    font-size: 0.8rem;
    padding: 6px 10px;
  }

  table {
    font-size: 0.75rem;
  }

  th, td {
    padding: 5px 3px;
  }

  button {
    padding: 4px 6px;
    margin: 1px;
    font-size: 0.7rem;
  }

  .charts {
    gap: 10px;
  }

  .chart-container {
    width: 200px;
    height: 200px;
    padding: 6px;
  }
}

@media (max-width: 480px) {
  .history-view {
    padding: 4px;
  }

  h1 {
    font-size: 1rem;
    margin-bottom: 8px;
  }

  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  table {
    font-size: 0.7rem;
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  th, td {
    padding: 4px 2px;
    min-width: 45px;
  }

  button {
    padding: 3px 5px;
    margin: 1px;
    font-size: 0.65rem;
  }

  .charts {
    gap: 8px;
  }

  .chart-container {
    width: 200px;
    height: 200px;
    padding: 5px;
    border-radius: 6px;
  }

  p {
    padding: 15px 10px;
    font-size: 0.95rem;
  }
}

@media (max-width: 360px) {
  .history-view {
    padding: 2px;
  }

  h1 {
    font-size: 0.9rem;
    margin-bottom: 6px;
  }

  table {
    font-size: 0.65rem;
  }

  th, td {
    padding: 3px 1px;
  }

  button {
    padding: 2px 4px;
    font-size: 0.6rem;
  }

  .charts {
    gap: 6px;
  }

  .chart-container {
    width: 200px;
    height: 00px;
    padding: 3px;
  }
}
</style>
