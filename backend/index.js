const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/price/:exchange/:crypto", async (req, res) => {
  const { exchange, crypto } = req.params;

  try {
    const url = `https://criptoya.com/api/${exchange}/${crypto}/ars`;


    const response = await axios.get(url);

    res.json(response.data);
  } catch (error) {
    console.error("CriptoYa error:", error.response?.data || error.message);
    res.status(500).json({ error: "Error fetching price data" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend activo en http://localhost:${PORT}`);
});
