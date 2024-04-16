const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: 'campus_app'
})

connection.connect();

module.exports =  connection;