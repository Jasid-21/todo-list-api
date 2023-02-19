const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.PORT,
    user: process.env.USER,
    database: process.env.DATABASE,
    password: process.env.PASSWORD
});

connection.connect((error) => {
    if (error) {
        console.error(error);
        return;
    }

    console.log("Database connected successfully!");
});

module.exports = connection;
