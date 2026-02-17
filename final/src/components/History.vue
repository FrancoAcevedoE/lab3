<template>
  <div class="history-view">
    <h1>HISTORY</h1>
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

      <!-- chart es la libreria gráficos -->
      <div class="charts-section" v-if="transactions.length">
        <div class="charts">
          <div class="chart-container">
            <canvas ref="buyChart"></canvas>
          </div>
          <div class="chart-container">
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
      chartInstances: []
    };
  },
  computed: {
    transactions() {
      return this.$store.getters.getTransactions;
    },
    // esto es el grafico
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
      this.$store.commit("deleteTransaction", id);
    },
    editTx(tx) {
      const newMoney = prompt(`Ingrese el nuevo monto en ARS para ${tx.crypto}:`, tx.totalARS);
      
      if (newMoney === null) {
        return; // Usuario canceló
      }
      
      const moneyValue = parseFloat(newMoney);
      if (isNaN(moneyValue) || moneyValue <= 0) {
        alert("Ingrese un monto válido mayor a 0");
        return;
      }
      tx.totalARS = moneyValue;
      
      // Si existe ID de API remota, hacer PATCH
      if (tx._id) {
        this.updateTransactionInAPI(tx._id, moneyValue);
      } else {
        alert("Transacción actualizada localmente");
      }
    },
    async updateTransactionInAPI(id, newMoney) {
      try {
        const response = await fetch(`https://laboratorio3-f36a.restdb.io/rest/transactions/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-apikey': '60eb09146661365596af552f'
          },
          body: JSON.stringify({ money: newMoney.toString() })
        });
        
        if (!response.ok) {
          // Intenta con la API alternativa
          const fallbackResponse = await fetch(`https://labor3-d60e.restdb.io/rest/transactions/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-apikey': 'd9002945094e72b41fbcfa71d2bcd0f4a540b'
            },
            body: JSON.stringify({ money: newMoney.toString() })
          });
          
          if (!fallbackResponse.ok) {
            throw new Error('Error actualizando transacción');
          }
          alert("Transacción actualizada exitosamente");
        } else {
          alert("Transacción actualizada exitosamente");
        }
      } catch (error) {
        console.error("Error al actualizar:", error);
        alert("Error al actualizar la transacción en la API");
      }
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
