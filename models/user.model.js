import { DataTypes, Model } from "sequelize";
import database from "../database/init.sql.js";

class User extends Model { }

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gender: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        comment: '0 = male, 1 = female'
    },

}, {
    modelName: 'user',
    paranoid: true,
    sequelize: database,
    tableName: 'user',
    collate: "utf8mb4_bin",
});

export default User;