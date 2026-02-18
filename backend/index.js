require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3001;

//solucion de error la key queda publica
const RESTDB_APIKEY = process.env.RESTDB_APIKEY;
const RESTDB_URL = "https://laboratorio3-f36a.restdb.io/rest/transactions";


// Configuración de CORS para el front
app.use(cors({
  origin: "http://localhost:8080", // Puerto del frontend
  credentials: true
}));
app.use(express.json());

// trae precio de una crypto específica
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

app.post("/transactions", async (req, res) => {
  try {
    const transaction = req.body;

    const response = await axios.post(
      RESTDB_URL,
      transaction,
      {
        headers: {
          "x-apikey": RESTDB_APIKEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error("Error guardando en RestDB:", error.response?.data || error.message);
    res.status(500).json({ error: "Error saving transaction" });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Backend activo en http://localhost:${PORT}`);
});
