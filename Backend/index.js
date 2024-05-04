const express = require('express');
const cors = require('cors');
const app = express();
const connection = require('./dbConnection/dbConnection.js')
const routes = require('./routes/routes.js');
const router = require('./routes/routes.js');
require('dotenv').config();

const port = process.env.PORT || 5000;
app.use(cors());
connection.connect();
app.use(express.json());
app.use('/', routes);
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
