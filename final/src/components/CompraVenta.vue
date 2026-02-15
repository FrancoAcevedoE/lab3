<template>
  <div class="box">
    <h1>BUY AND SELL CRYPTO</h1>
    <button @click="setAction('purchase')">Comprar</button>
    <button @click="setAction('sale')">Vender</button>
    <p v-if="action">
      Accion seleccionada: <strong>{{ action }}</strong>
    </p>

    <p>Selección de cryptomoneda</p>
    <!-- select dinamico desde API -->
    <select v-model="cryptoSelected">
      <option value="">Selecione una Crypto</option>
      <option v-for="crypto in cryptos" :key="crypto" :value="crypto">
        {{ crypto.toUpperCase() }}
      </option>
    </select>

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
      cryptos: ["btc", "eth", "ltc", "xrp", "bch"],
      action: null,
       // propiedad para determinar si es compra o venta
    };
  },
  // ciclo de vida del componente
  mounted() {
    this.loadCryptos();
  },
  
  // metodos
  methods: {
    // setea la accion a realizar compra o venta
    setAction(type) {
      this.action = type;
    },
   // trae las crypto desde la API criptoya y las guarda en el estado del componente
    async loadCryptos() {
      try {
        const response = await fetch("https://criptoya.com/api/argenbtc/ars");
        const data = await response.json();
        this.cryptos = data;
      } catch (error) {
        console.error("Error al cargar las cryptos:", error);
      }
    },
    // obtiene el precio de la crypto seleccionada desde la API criptoya y lo devuelve segun la accion que se quiera realizar compra o venta
    async getCryptoPrice() {
      const crypto = this.cryptoSelected.toUpperCase();
      const amount = this.cant;

      const res = await fetch(
    `https://criptoya.com/api/lemoncash/${crypto}/ARS/${amount}`);
    if (!res.ok) {
      throw new Error("Error al obtener el precio de la crypto");
    }
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
        id: Date.now(),
        userID: this.userID,
        type: this.action === "purchase" ? "compra" : "venta",
        crypto: this.cryptoSelected.toUpperCase(),
        amount: this.cant,
        price: price,
        totalARS: totalARS,
        date: new Date().toLocaleDateString('es-AR')
      };
      
      // Guardar en el store de Vuex
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
      
      // Limpiar el formulario
      this.cant = 0;
      this.cryptoSelected = "";
      this.action = null;
      // compra y venta con validaciones para verificar que el usuario haya iniciado sesion, que
      // la cantidad no sea negativa y que haya suficiente saldo para realizar la compra
    },
  },
};
</script>

<style>
@import "../assets/main.css";
</style>
