<template>
  <div class="box">
    <h1>BUY AND SELL CRYPTO</h1>
    <div class="balance-display">
      <p>
        Saldo: <strong>${{ formattedBalance }}</strong> ARS
      </p>
    </div>

    <div class="action-buttons">
      <button
        @click="setAction('purchase')"
        :class="{ active: action === 'purchase' }"
        class="action-btn buy-btn"
      >
        Comprar
      </button>
      <button
        @click="setAction('sale')"
        :class="{ active: action === 'sale' }"
        class="action-btn sell-btn"
      >
        Vender
      </button>
    </div>

    <p v-if="action">
      Acción seleccionada:
      <strong>{{ action === "purchase" ? "Comprar" : "Vender" }}</strong>
    </p>

    <div v-if="action">
      <p>Selección de cryptomoneda</p>
      <!-- esto lo llama desde la api -->
      <select v-model="cryptoSelected">
        <option value="" disabled>Seleccione una Crypto</option>
        <option v-for="crypto in cryptos" :key="crypto.id" :value="crypto.id">
          {{ crypto.name }}
        </option>
      </select>
      <p v-if="cryptoPrice">
        Valor de la moneda en ARS:
        <strong>${{ cryptoPrice.toLocaleString("es-AR") }}</strong>
      </p>

      <p>Ingrese la cantidad</p>
      <input
        type="number"
        v-model.number="cant"
        placeholder="Cantidad"
        min="0"
        step="any"
      />
      <br /><br />

      <div v-if="cant > 0 && cryptoPrice" class="summary">
        <p>
          Total a {{ action === "purchase" ? "pagar" : "recibir" }}:
          <strong>${{ (cant * cryptoPrice).toLocaleString("es-AR") }}</strong>
        </p>
      </div>

      <button
        @click.prevent="finishTransaction"
        class="input-button confirm-btn"
        :disabled="!cryptoPrice"
      >
        Confirmar Transacción
      </button>
    </div>

    <div v-if="message.text" :class="['message', message.type]">
      {{ message.text }}
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
  name: "CompraVenta",
  //   los props son para recibir el userID desde el componente padre App.vue son propiedades que se pasan al componente hijo
  props: {
    userID: {
      type: String,
      required: true,
    },
  },
  //   estado del componente
  data() {
    return {
      cant: 0,
      cryptoSelected: "",
      cryptos: [],
      action: null,
      cryptoPrice: null,
      message: {
        type:'',
        text: '',
      }
    };
  },

  computed: {
    formattedBalance() {
      const balance = this.$store.getters.getCurrentUserBalance;
      return balance.toLocaleString('es-AR');
    }
  },


  mounted() {
    this.loadCryptos();
  },
  // watch para actualizar el precio cada vez que se seleccione una crypto o se cambie la accion
  watch: {
  async cryptoSelected(newCrypto) {
    this.message = { type: '', text: '' };
    if (!newCrypto || !this.action) {
      this.cryptoPrice = null;
      return;
    }
    console.log('crypto selected ok')

    try {
      this.cryptoPrice = await this.getCryptoPrice();
      if(!this.cryptoPrice)
      throw new Error ('Error obteniendo precio de la cryptomoneda');
    } catch (e) {
      this.cryptoPrice = null;
      this.message = {type: 'error', text: 'Error obteniendo precio de la cryptomoneda'}
    }
  },

  async action() {
    this.message = {type: '', text: ''};
    if (this.cryptoSelected) {
      this.cryptoPrice = await this.getCryptoPrice();
    }
  }
},

  methods: {
    // es para saber si va a realizar compra o venta
    setAction(type) {
      this.action = type;
      this.message = { type: '', text: '' };
    },

   // trae las crypto desde la API criptoya y las guarda
    async loadCryptos() {
      try {
        const res = await fetch("http://localhost:3001/cryptos");
        const data = await res.json();
        if (Array.isArray(data)) {
          this.cryptos = data;

        } else if (data && typeof data === 'object') {
          this.cryptos = Object.keys(data).map(key => ({ id: key, name: data[key].name || key }));

        } else {
          this.cryptos = [];
        }

      } catch (error) {
        console.error("Error al cargar las cryptos:", error);
         this.message = { type: 'error', text: 'Error cargando criptomonedas. Asegúrese de que el backend esté corriendo.' };
      }
    },
//esto es para que cada vez que se seleccione una crypto
// o se cambie la accion se actualice el precio de la crypto seleccionada

    async getCryptoPrice() {
      const res = await fetch(`http://localhost:3001/price/lemoncash/${this.cryptoSelected}`);
      const data = await res.json();
      // compra al precio de vendedor y venta al precio comprador
      return this.action === "purchase" ? data.totalAsk : data.totalBid;
    },


    // finaliza la transaccion de compra o venta
    async finishTransaction() {
      this.message = { type: '', text: '' };

      if (!this.userID) {
         this.message = { type: 'error', text: "Por favor inicie sesión para realizar una compra o venta" };
        return;
      }

      if (!this.action) {
       this.message = { type: 'error', text: "Por favor seleccione una acción: comprar o vender" };
        return;
      }
      if (!this.cryptoSelected) {
        this.message = { type: 'error', text: "Por favor seleccione una cryptomoneda" };
        return;
      }
      if (this.cant <= 0) {
        this.message = { type: 'error', text: "La cantidad debe ser mayor a cero" };
        return;
      }
      try {
        const price = await this.getCryptoPrice();
        const totalARS = price * this.cant;

        if (this.action === "purchase")
          {
            const currentBalance = this.$store.getters.getCurrentUserBalance;
            if (totalARS > currentBalance) {
              this.message = { type: 'error', text: `Saldo insuficiente. Necesitas $${totalARS.toLocaleString('es-AR')} pero tienes $${currentBalance.toLocaleString('es-AR')}` };
                return;
             }
        }
         else {
            // Validar tenencia de crypto si es venta
            const cryptoBalances = this.$store.getters.getCryptoBalances;
            // Aseguramos mayúsculas para coincidir con lo guardado
            const symbol = this.cryptoSelected.toUpperCase();
            const available = cryptoBalances[symbol] || 0;
            
            if (this.cant > available) {
                 this.message = { type: 'error', text: `Saldo insuficiente. Tienes ${available.toFixed(0)} ${symbol} y quieres vender ${this.cant} ${symbol}` };
                 return;
            }
          }

      // Crear objeto de transacción
      const transaction = {
        userID: this.userID,
        type: this.action === "purchase" ? "compra" : "venta",
        crypto: this.cryptoSelected.toUpperCase(),
        amount: this.cant,
        price: price,
        totalARS: totalARS,
        date: new Date().toLocaleString('es-AR')
      };

      // Guardar en el store de Vuex (automáticamente guarda en localStorage)
      this.$store.commit('addTransaction', transaction);

      if (this.action === "purchase") {
          this.message = { 
              type: 'success', 
              text: `Compra realizada exitosamente. Gastado: $${totalARS.toLocaleString('es-AR')} ARS` 
          };
        } else {
          this.message = { 
              type: 'success', 
              text: `Venta realizada exitosamente. Recibido: $${totalARS.toLocaleString('es-AR')} ARS` 
          };
        }

      this.cant = 0;
    }catch (e) {
      console.error(e);
      this.message = { type: 'error', text: "Error procesando la transacción" };
    }
  },
}
}
</script>

<style>
@import "../assets/main.css";

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
.action-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
}

.action-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    transition: all 0.3s ease;
    background-color: #ddd;
    color: #555;
}

.action-btn.active {
    background-color: #2d7a3e;
    color: white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.summary {
    background-color: #e8f5e9;
    padding: 10px;
    border-radius: 5px;
    margin: 10px 0;
}

.message {
    padding: 10px;
    border-radius: 5px;
    margin-top: 15px;
    text-align: center;
    font-weight: bold;
}

.message.error {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ef9a9a;
}

.message.success {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
}

.confirm-btn {
    background-color: #2d7a3e;
    color: white;
    border: none;
    margin-top: 10px;
}
.confirm-btn:hover {
    background-color: #1b5e20;
}
.confirm-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
</style>
