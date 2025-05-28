import { DataTypes, Model } from "sequelize";
import database from "../database/init.sql.js";
import User from "./user.model.js";

class Blog extends Model { }

Blog.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    modelName: 'blog',
    paranoid: true,
    sequelize: database,
    tableName: 'blog',
    collate: "utf8mb4_bin",
});

export default Blog;

User.hasMany(Blog, { foreignKey: 'userId' });
Blog.hasMany(User, { foreignKey: 'userId' });

User.beforeDestroy(async (user, options) => {
    await Blog.destroy({ where: { userId: user.id } });
});