import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, Device, } from '../models/index.js';
import { dataFound, dataNotFound, parameterNotFound, responseSender, showLog, } from '../helper/function.helper.js';
import { StatusCode } from '../server/statusCode.js';
import { StringConst } from '../server/stringConst.js';
import { userLoginValidator, userSignupValidator } from '../validations/user.validation.js';

const { JWT_ACCESS_TOKEN_KEY, JWT_ACCESS_EXPIRY, JWT_REFRESH_TOKEN_KEY } = process.env;

export class AuthController {

    static signup = async (req, res, next) => {
        try {
            showLog('Signup api called');
            await userSignupValidator.validate(req.body, { abortEarly: false });

            const isThere = await User.findOne({ where: { email: req.body.email, phone: req.body.phone } });
            dataFound(isThere, 'User', StatusCode.BADREQUEST, true);

            const user = await User.create({ ...req.body, password: await bcrypt.hash(req.body.password, 15) });

            const accessToken = jwt.sign({ id: user.id }, JWT_ACCESS_TOKEN_KEY, { expiresIn: JWT_ACCESS_EXPIRY });
            const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_TOKEN_KEY);

            await Device.create({ deviceId: req.body.deviceId, accessToken, refreshToken, userId: user.id });

            showLog('User created');
            return responseSender(res, 'User created successfully', StatusCode.CREATED, user);
        } catch (error) {
            if (error.name === 'ValidationError') {
                return responseSender(res, 'Validation failed', StatusCode.BADREQUEST, error.errors);
            }
            next(error);
        }
    };

    static login = async (req, res, next) => {
        try {
            showLog('Login api called');

            await userLoginValidator.validate(req.body, { abortEarly: false });

            const user = await User.findOne({ where: { email: req.body.email } });
            dataNotFound(user, 'User', StatusCode.NOT_FOUND, true);

            const isEqual = await bcrypt.compare(req.body.password, user.password);
            dataNotFound(isEqual, 'Password not matched', StatusCode.BADREQUEST);

            const accessToken = jwt.sign({ id: user.id }, JWT_ACCESS_TOKEN_KEY, { expiresIn: JWT_ACCESS_EXPIRY });
            const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_TOKEN_KEY);

            let device = await Device.findOne({
                where: { userId: user.id, deviceId: req.body.deviceId }
            });

            if (device) {
                await device.update({
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                })
            } else {
                await Device.create({
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    deviceId: req.body.deviceId,
                    userId: user.id
                });
            }
            showLog('Login succesfully');

            return responseSender(res, 'Logged in successfully', StatusCode.OK, { device, user });
        } catch (error) {
            if (error.name === 'ValidationError') {
                return responseSender(res, 'Validation failed', StatusCode.BADREQUEST, error.errors);
            }
            next(error);
        }
    };

    static createAccessFromRefreshToken = async (req, res, next) => {
        try {
            showLog('Regenerate Token api');

            const header = req.get('Authorization');
            dataNotFound(header, 'Token', StatusCode.NOT_FOUND, true);

            const JWToken = header.split(' ')[1];
            dataNotFound(JWToken, 'Token', StatusCode.NOT_FOUND, true);

            const token = jwt.verify(JWToken, process.env.JWT_REFRESH_TOKEN_KEY);
            dataNotFound(token, StringConst.INVALID_TOKEN, StatusCode.UNAUTHORIZED);

            const user = await User.findByPk(token.id);
            dataNotFound(user, 'User', StatusCode.NOT_FOUND, true);

            const device = await Device.findOne({ where: { refreshToken: JWToken }, });
            dataNotFound(device, 'Invalid device', StatusCode.FORBIDDEN);

            const accessToken = jwt.sign({ id: user.id }, JWT_ACCESS_TOKEN_KEY, { expiresIn: JWT_ACCESS_EXPIRY });

            await device.update({ accessToken: accessToken });

            showLog('Token generated');

            return responseSender(res, 'Token regenrated', StatusCode.OK, {
                ...user.dataValues,
                accessToken: accessToken,
                refreshToken: JWToken,
            });
        } catch (error) {
            next(error);
        }
    };

    static logOut = async (req, res, next) => {
        try {
            showLog('Logout api called');

            parameterNotFound(req.query.deviceId, 'deviceId');
            await Device.destroy({ where: { deviceId: req.query.deviceId }, force: true, });
            showLog('User logged out successfullyF');

            return responseSender(res, 'Logged out', StatusCode.OK);
        } catch (error) {
            next(error);
        }
    };
}
