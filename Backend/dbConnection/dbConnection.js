const mysql = require('mysql');
require('dotenv').config();
const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: 'campus_app'
})

module.exports = connection