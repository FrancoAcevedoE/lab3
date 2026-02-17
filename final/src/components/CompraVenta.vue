<template>
  <div class="box">
    <h1>BUY AND SELL CRYPTO</h1>
    <div class="balance-display">
      <p>Saldo: <strong>${{ formattedBalance }}</strong> ARS</p>
    </div>
    <button @click="setAction('purchase')">Comprar</button>
    <button @click="setAction('sale')">Vender</button>
    <p v-if="action">
      Accion seleccionada: <strong>{{ action }}</strong>
    </p>

    <p>Selección de cryptomoneda</p>
    <!-- esto lo llama desde la api -->
    <select v-model="cryptoSelected">
      <option value="">Selecione una Crypto</option>
      <option
        v-for="crypto in cryptos"
        :key="crypto.id"
        :value="crypto.id">
        {{ crypto.name }}
      </option>
    </select>
    <p v-if="cryptoPrice">valor de la moneda en ARS: <strong>{{ cryptoPrice }}</strong></p>

    <p>ingrese la cantidad</p>
    <input type="number" v-model.number="cant" placeholder="cantidad" />
    <br /><br />
    <p>cantidad ingresada: {{ cant }}</p>
    <input
      type="submit"
      value="finish"
      @click.prevent="finishTransaction"
      class="input-button"
    />
  </div>
   <footer>
    <p style="text-align: center; margin-top: 20px">
      &copy; 2024 YouWallet by Franco. All rights reserved.
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
      cryptos: [""],
      action: null,
      cryptoPrice: null,
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
    if (!newCrypto || !this.action) {
      this.cryptoPrice = null;
      return;
    }
    console.log('crypto selected ok')

    try {
      this.cryptoPrice = await this.getCryptoPrice();
    } catch (e) {
      console.error("Error obteniendo precio", e);
      this.cryptoPrice = null;
    }
  },

  async action() {
    if (this.cryptoSelected) {
      this.cryptoPrice = await this.getCryptoPrice();
    }
  }
}, 

  methods: {
    // es para saber si va a realizar compra o venta
    setAction(type) {
      this.action = type;
    },

   // trae las crypto desde la API criptoya y las guarda
    async loadCryptos() {
      try {
        const res = await fetch("http://localhost:3001/cryptos");
        const data = await res.json();
        if (Array.isArray(data)) {
          this.cryptos = data;
        } else if (data && typeof data === 'object') {
          this.cryptos = Object.keys(data);
        } else {
          this.cryptos = [];
        }
        console.log("Cryptos cargadas:", this.cryptos);
      } catch (error) {
        console.error("Error al cargar las cryptos:", error);
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
      if (!this.userID) {
        alert("por favor inicie sesion para realizar una compra o venta");
        return;
      }
      if (!this.action) {
        alert("por favor seleccione una accion: comprar o vender");
        return;
      }
      if (!this.cryptoSelected) {
        alert("por favor seleccione una cryptomoneda");
        return;
      }
      if (this.cant <= 0) {
        alert("la cantidad debe ser mayor a cero");
        return;
      }
      const price = await this.getCryptoPrice();
      const totalARS = price * this.cant;
      
      
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
        alert(
          `compra realizada \nCrypto: ${this.cryptoSelected}\nGastado: $${totalARS} ARS`,
        );
      } else {
        alert(
          `venta realizada \nCrypto: ${this.cryptoSelected}\nRecibido: $${totalARS} ARS`,
        );
      }
      this.cant = 0;
      this.cryptoSelected = "";
      this.action = null;
      this.cryptoPrice = null;
    },
  },
};
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
</style>
