const express = require('express');
const axios = require('axios');
const cors = require('cors');


const app = express();
const port = 3001;

// midlewares sirven para agregar funcionalidades a las rutas, como por ejemplo, permitir
//  el acceso a recursos desde otros dominios (CORS) o parsear el cuerpo de las solicitudes en formato JSON.
app.use(cors());
app.use(express.json());

app.get('/price/:exchange/:crypto', async (req, res) => {
    const [exchange, crypto] = req.params;
    try {
        const res = await axios.get(`https://criptoya.com/api/${exchange}/${crypto}/ARS/0.1`
    );
        res.json(res.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching price data' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});