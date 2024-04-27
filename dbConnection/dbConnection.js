const mysql2 = require('mysql2');
require('dotenv').config();
const connection = mysql2.createConnection({
    host: 'localhost',
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: 'campus_app'
})

module.exports = connection