import express from "express";
import { route, successRoute } from "./routes/index.js";
import ServerStatusModel from "./models/ServerStatusModel.js";
import DatabaseSyncModel from "./models/DatabaseSyncModel.js";
import ShortUrlModel from "./models/ShortUrlModel.js";
import { ApplicationError } from "./lib/errors.js";

const serverStatusModel = new ServerStatusModel();
const databaseSyncModel = new DatabaseSyncModel();
const shortUrlModelModel = new ShortUrlModel();

export default function createRouter() {
    const router = express.Router();

    router.get(
        "/status",
        route(async (req, res) => {
            try {
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
        "/shortid",
        route(
            async (req, res) => {
                const response = await shortUrlModelModel.createShortId(
                    req.query.id,
                    req.body,
                );
                return res.send(successRoute(response));
            },
            // { requiredFields: ["redirectUrl"] },
        ),
    );

    // Get Short URL Route
    router.get(
        "/:shortId",
        route(async (req, res) => {
            const visitData = {
                userAgent: req.get("user-agent"),
                ipAddress: req.ip,
                referrer: req.get("referer"),
            };
            const response = await shortUrlModelModel.getShortUrl(
                req.params.shortId,
                visitData,
            );
            console.log(
                "🚀 ~ createRouter ~ req.query:",
                req.query,
                req.query?.redirectFlag == false,
            );
            if (req.query?.redirectFlag == "false" || !response?.redirectUrl) {
                return res.send(successRoute(response));
            }
            return res.redirect(response?.redirectUrl);
        }),
    );

    // Get Visit History Route
    router.get(
        "/analytics/:shortId",
        route(async (req, res) => {
            const response = await shortUrlModelModel.getVisitHistory(
                req.params?.shortId,
            );
            return res.send(successRoute(response));
        }),
    );

    router.use((err, req, res, next) => {
        // Handle request aborted errors specifically
        if (err.code === "ECONNABORTED" || err.type === "request.aborted") {
            console.warn("Request aborted", {
                error: err.message,
                code: err.code,
                type: err.type,
                expected: err.expected,
                length: err.length,
                received: err.received,
                url: req.url,
                method: req.method,
            });

            // Don't send response if headers already sent or connection closed
            if (!res.headersSent && !req.destroyed) {
                res.status(499).json({
                    message: "Request aborted by client",
                    statusCode: 499,
                    error: "CLIENT_CLOSED_REQUEST",
                });
            }
            return;
        }

        console.error("ERROR in Routes", err);

        if (err instanceof ApplicationError) {
            res.status(err.statusCode).send({
                message: err.message,
                statusCode: err.statusCode,
                data: err?.data || err || {},
            });
            return;
        }

        console.error("Uncaught error", err);
        res.status(500).send({
            message: "Uncaught error",
            statusCode: 500,
        }); // uncaught exception
    });

    return router;
}
