import express from "express";
import cors from "cors";
import path from "path";

import { StatusCode } from "./statusCode.js";
import { StringConst } from "./stringConst.js";
import router from '../routes/index.js';
import database from "../database/init.sql.js"

const { Auth, Blog } = router;

export const initExpress = async () => {
    const app = express();

    app.set('view engine', 'ejs');

    app.use(express.json());
    app.use(cors({ origin: "*" }));

    const __dirname = path.resolve();
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    app.get("/", async (req, res, next) => {
        res.json({
            service: "Blog Management",
            status: "running"
        });
    });

    app.use('/api/v1/auth', Auth);
    app.use('/api/v1/blog', Blog);

    app.use((error, req, res, next) => {
        console.log(error);
        console.error('API :- ', req.url);
        const message = error.message;
        let statusCode = error.statusCode || StatusCode.SERVER_ERROR;
        if (error.name === 'TokenExpiredError') {
            statusCode = StatusCode.UNAUTHORIZED;
        }
        return res.status(statusCode).json({ message, statusCode, status: false });
    });

    app.listen(process.env.PORT, async () => {
        console.info(StringConst.CONNECTED);
    });

    database.sync({ alter: true }).then(() => console.info(StringConst.DATABASE_CONNECTION_MESSAGE)).catch((error) => console.error(error));
}