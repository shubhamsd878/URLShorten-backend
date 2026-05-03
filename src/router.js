import express from "express";
import { route, successRoute } from "./routes/index.js";
import ServerStatusModel from "./models/ServerStatusModel.js";
import DatabaseSyncModel from "./models/DatabaseSyncModel.js";
import ShortUrlModel from "./models/ShortUrlModel.js";

const serverStatusModel = new ServerStatusModel();
const databaseSyncModel = new DatabaseSyncModel();
const shortUrlModelModel = new ShortUrlModel();

export default function createRouter() {
    const router = express.Router();

    router.get(
        "/status",
        route(async (req, res) => {
            try {
                console.log(
                    "🚀 ~ serverStatusModel:",
                    serverStatusModel?.getServerStatus,
                );
                const response = await serverStatusModel.getServerStatus();
                console.log("🚀 ~ createRouter ~ response:", response);
                return res.send(successRoute(response));
            } catch (error) {
                // Error handled by route wrapper
            }
        }),
    );

    router.get(
        "/status",
        route(async (req, res) => {
            try {
                const response = await ServerStatusModel.getServerStatus();
                console.log("🚀 ~ createRouter ~ response:", response);
                return res.send(successRoute(response));
            } catch (error) {}
        }),
    );

    // Database Sync Routes
    router.post(
        "/db/sync",
        route(
            async (req, res) => {
                const response = await databaseSyncModel.syncTables(req.body);
                return res.send(successRoute(response));
            },
            { requiredFields: ["tables"] },
        ),
    );

    router.get(
        "/db/sync/tables",
        route(async (req, res) => {
            const response = await databaseSyncModel.getAvailableTables();
            return res.send(successRoute(response));
        }),
    );

    router.post(
        "/db/sync/all",
        route(async (req, res) => {
            const response = await databaseSyncModel.syncAllTables(
                req.body || {},
            );
            return res.send(successRoute(response));
        }),
    );

    // Create Short URL Route
    router.post(
        "/:id",
        route(
            async (req, res) => {
                const response = await shortUrlModelModel.createShortId(
                    req.params.id,
                    req.body,
                );
                return res.send(successRoute(response));
            },
            { requiredFields: ["redirectUrl"] },
        ),
    );

    // Get Short URL Route
    router.get(
        "/:shortId",
        route(async (req, res) => {
            const response = await shortUrlModelModel.getShortUrl(
                req.params.shortId,
            );
            return res.send(successRoute(response));
        }),
    );

    return router;
}
