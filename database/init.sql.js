import { Sequelize } from "sequelize";
import mysql from "mysql2";

import { StringConst } from "../server/stringConst.js";

const { DATABASE, DB_USERNAME, PASSWORD, HOST, DBPORT, MAXIMUM_RETRY_COUNT, RETRY_TIMEOUT, CONNECTION_TIMEOUT } = process.env;

try {
    mysql.createConnection({
        host: HOST,
        port: DBPORT,
        user: DB_USERNAME,
        password: PASSWORD
    }).query(`CREATE DATABASE IF NOT EXISTS ${DATABASE};`);
} catch (error) {
    console.error("MySQL connection failed:", error);
}

const connection = new Sequelize(DATABASE, DB_USERNAME, PASSWORD, {
    dialect: "mysql",
    host: HOST,
    port: DBPORT,
    logging: false,
    connectTimeout: CONNECTION_TIMEOUT,
    retry: {
        max: MAXIMUM_RETRY_COUNT,
        timeout: RETRY_TIMEOUT,
        match: [/ETIMEDOUT/, /ECONNREFUSED/, /SequelizeConnectionError/],
    },
});

connection.authenticate()
    .then(() => console.info(StringConst.AUTHENTICATE_MESSAGE))
    .catch(err => console.error("DB Auth failed:", err));

export default connection;