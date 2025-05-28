import { DataTypes, Model } from "sequelize";
import database from "../database/init.sql.js";
import Blog from "./blog.model.js";

class Document extends Model { }

Document.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.STRING
    },
    url: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    }
}, {
    modelName: 'document',
    paranoid: true,
    sequelize: database,
    tableName: 'document',
    collate: "utf8mb4_bin",
});

export default Document;

Blog.hasMany(Document, { foreignKey: 'blogId' });
Document.belongsTo(Blog, { foreignKey: 'blogId' });

Blog.beforeDestroy(async (blog, options) => {
    await Document.destroy({ where: { blogId: blog.id } });
});