const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createPool({
    host: process.env.PORT,
    user: process.env.USER,
    database: process.env.DATABASE,
    password: process.env.PASSWORD
});

module.exports = connection;
