import { DataTypes, Model } from "sequelize";
import database from "../database/init.sql.js";
import User from "./user.model.js";

class Device extends Model { }

Device.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    deviceId: {
        type: DataTypes.STRING
    },
    accessToken: {
        type: DataTypes.STRING
    },
    refreshToken: {
        type: DataTypes.STRING
    },
}, {
    modelName: 'device',
    paranoid: true,
    sequelize: database,
    tableName: 'device',
    collate: "utf8mb4_bin",
});

export default Device;

User.hasMany(Device, { foreignKey: 'userId' });
Device.belongsTo(User, { foreignKey: 'userId' });

User.beforeDestroy(async (user, options) => {
    await Device.destroy({ where: { userId: user.id } });
});