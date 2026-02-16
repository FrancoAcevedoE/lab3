const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3001;

// Configuración de CORS para el frontend
app.use(cors({
  origin: "http://localhost:8080", // Puerto del frontend Vue
  credentials: true
}));
app.use(express.json());

// // Obtener lista de cryptos disponibles
// app.get("/cryptos/:exchange", async (req, res) => {
//   const { exchange } = req.params;

//   try {
//     const url = `https://criptoya.com/api/${exchange}`;
//     const response = await axios.get(url);
//     res.json(response.data);
//   } catch (error) {
//     console.error("CriptoYa error:", error.response?.data || error.message);
//     res.status(500).json({ error: "Error fetching cryptos data" });
//   }
// });

// Obtener precio de una crypto específica
app.get("/price/:exchange/:crypto", async (req, res) => {
  const { exchange, crypto } = req.params;

  try {
    const url = `https://criptoya.com/api/${exchange}/${crypto}/ARS/0.1`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("CriptoYa error:", error.response?.data || error.message);
    res.status(500).json({ error: "Error fetching price data" });
  }
});
app.get("/cryptos", (req, res) => {
  res.json([
    { id: "BTC", name: "Bitcoin" },
    { id: "ETH", name: "Ethereum" },
    { id: "LTC", name: "Litecoin" },
    { id: "XRP", name: "Ripple" },
    { id: "BCH", name: "Bitcoin Cash" }
  ]);
});




app.listen(PORT, () => {
  console.log(`✅ Backend activo en http://localhost:${PORT}`);
});
