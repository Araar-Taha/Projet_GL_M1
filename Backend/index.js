const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('DVF en live');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('error serveur');
});

app.listen(PORT, () => {
    console.log(`Server roule sur http://localhost:${PORT}`);
});
