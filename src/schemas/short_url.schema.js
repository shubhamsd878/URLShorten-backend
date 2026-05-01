import BaseModel from "../models/BaseModel.js";
import Sequelize from "sequelize";
import { TABLE_NAME } from "../lib/constants.js";
export class ShortUrlSchema extends BaseModel {
    constructor(connection) {
        super(connection);
    }
    UxModals = () => {
        const shorUrl = this.connection.define(
            TABLE_NAME.SHORT_URL_TABLE,
            {
                id: {
                    type: Sequelize.UUID,
                    primaryKey: true,
                },
                shortUrl: {
                    type: Sequelize.STRING,
                    required: true,
                    unique: true,
                },
                redirectUrl: {
                    type: Sequelize.STRING,
                    required: true,
                    unique: true,
                },
                visitHistory: {
                    type: Sequelize.JSON,
                    default: [],
                    allowNull: true,
                },
            },
            {
                charset: "utf8mb4",
                collate: "utf8mb4_unicode_ci",
                timestamps: true,
                paranoid: true,
                freezeTableName: true,
                tableName: TABLE_NAME.SHORT_URL_TABLE,
            },
        );
        return shorUrl;
    };
}
export default new ShortUrlSchema();
