import axios from "axios";

const apiClient = axios.create({
  //se reemplazo la key directamente por el llamado al backend
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// esto agrega el token a cada request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const finishTransaction = async function () {
  if (!this.validateData()) return;

  try {
    const price = await this.getCryptoPrice(this.moneda, this.action);

    const total = price * this.cant;

    const res = await apiClient.post("/transactions", {
      userID: this.userID,
      type: this.action,
      crypto: this.moneda,
      amount: this.cant,
      price: price,
      total: total,
      date: new Date().toISOString(),
    });
    alert(`Transacción realizada con éxito total: $${total}`);
    console.log("guardado en RestDB", res.data);
  } catch (error) {
    console.error("ERROR", error.res || error);
    alert("Error al realizar la transacción");
  }
  this.resetForm();
};

export default apiClient;
