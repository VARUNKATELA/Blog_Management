import jwt from "jsonwebtoken"
import { dataNotFound } from "../helper/function.helper.js";
import { User } from "../models/index.js";
import { StatusCode } from "../server/statusCode.js";

export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.get("Authorization");
        dataNotFound(authHeader, 'Token', StatusCode.NOT_FOUND, true);

        const JWToken = authHeader.split(" ")[1];
        dataNotFound(JWToken, 'Token', StatusCode.NOT_FOUND, true);

        const token = jwt.verify(JWToken, process.env.JWT_ACCESS_TOKEN_KEY);
        dataNotFound(token, 'Invalid Token', StatusCode.UNAUTHORIZED)

        const user = await User.findByPk(token.userId);
        dataNotFound(user, 'User', StatusCode.NOT_FOUND, true);
        req.userId = user.id;

        next();
    } catch (error) {
        next(error);
    }
};
