import BaseModel, { sequelize } from "./BaseModel.js";
import { ShortUrlSchema } from "../schemas/short_url.schema.js";
import { TABLE_NAME } from "../lib/constants.js";

const SCHEMA_REGISTRY = {
    [TABLE_NAME.SHORT_URL_TABLE]: new ShortUrlSchema().UxModals(),
};

export default class DatabaseSyncModel extends BaseModel {
    constructor() {
        super();
    }

    /**
     * Sync specific tables to the database
     * @param {Object} body - Request body with tables, alter, force
     * @returns {Promise<Object>} Sync result with status and details
     */
    async syncTables(body = {}) {
        const { tables, alter = false, force = false } = body;

        if (!Array.isArray(tables) || tables.length === 0) {
            throw new Error("Tables must be a non-empty array");
        }
        const syncResults = {};
        const errors = [];

        console.log(
            `📋 DB Sync Query: Syncing tables [${tables.join(", ")}] with options:`,
            { alter, force },
        );

        for (const tableName of tables) {
            try {
                if (!SCHEMA_REGISTRY[tableName]) {
                    const msg = `Table "${tableName}" not found in schema registry`;
                    errors.push(msg);
                    console.log(`❌ Query Log: ${msg}`);
                    continue;
                }

                console.log(`🔄 Query: Syncing table "${tableName}"...`);
                const model = SCHEMA_REGISTRY[tableName];
                await model.sync({ alter, force });

                syncResults[tableName] = {
                    status: "success",
                    message: `Table "${tableName}" synced successfully`,
                };

                console.log(
                    `✅ Query Log: Successfully synced table "${tableName}"`,
                );
            } catch (error) {
                const errMsg = `Failed to sync table "${tableName}": ${error.message}`;
                errors.push(errMsg);
                syncResults[tableName] = {
                    status: "error",
                    message: error.message,
                };
                console.error(`❌ Query Log: ${errMsg}`);
            }
        }

        return {
            success: errors.length === 0,
            totalTables: tables.length,
            syncedTables: Object.keys(syncResults).length,
            results: syncResults,
            errors: errors.length > 0 ? errors : null,
        };
    }

    /**
     * Get available tables that can be synced
     * @returns {Promise<Object>} Available tables data
     */
    async getAvailableTables() {
        const tables = Object.keys(SCHEMA_REGISTRY);
        console.log(
            `📋 Query: Fetching available tables. Found: [${tables.join(", ")}]`,
        );

        return {
            tables,
            totalTables: tables.length,
        };
    }

    /**
     * Sync all tables in the schema registry
     * @param {Object} body - Request body with alter, force
     * @returns {Promise<Object>} Sync result
     */
    async syncAllTables(body = {}) {
        const { alter = false, force = false } = body;
        const allTables = Object.keys(SCHEMA_REGISTRY);

        console.log(`📋 DB Sync Query: Syncing ALL tables with options:`, {
            alter,
            force,
        });

        const syncResults = {};
        const errors = [];

        for (const tableName of allTables) {
            try {
                console.log(`🔄 Query: Syncing table "${tableName}"...`);
                const model = SCHEMA_REGISTRY[tableName];
                await model.sync({ alter, force });

                syncResults[tableName] = {
                    status: "success",
                    message: `Table "${tableName}" synced successfully`,
                };

                console.log(
                    `✅ Query Log: Successfully synced table "${tableName}"`,
                );
            } catch (error) {
                const errMsg = `Failed to sync table "${tableName}": ${error.message}`;
                errors.push(errMsg);
                syncResults[tableName] = {
                    status: "error",
                    message: error.message,
                };
                console.error(`❌ Query Log: ${errMsg}`);
            }
        }

        return {
            success: errors.length === 0,
            totalTables: allTables.length,
            syncedTables: Object.keys(syncResults).length,
            results: syncResults,
            errors: errors.length > 0 ? errors : null,
        };
    }
}
