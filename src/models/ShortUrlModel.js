import BaseModel from "./BaseModel.js";
import { nanoid } from "nanoid";
import { v4 as uuidv4 } from "uuid";
import ShortUrlSchema from "../schemas/short_url.schema.js";
import { ApplicationError } from "../lib/errors.js";
import { TABLE_NAME } from "../lib/index.js";

export default class ShortUrlModel extends BaseModel {
    constructor(connection) {
        super(TABLE_NAME.SHORT_URL_TABLE, connection);
        this.db = connection;

        this.shortUrlschema = ShortUrlSchema.UxModals();
        this.shortUrlTable = TABLE_NAME.SHORT_URL_TABLE;
        this.shortUrlModel = this.connection.model(
            this.shortUrlTable,
            this.shortUrlschema,
        );
    }

    /**
     * Create a short URL entry in the database
     * @param {string} redirectUrl - The original URL to redirect to
     * @param {Object} options - Optional configuration
     * @param {number} options.shortIdLength - Length of generated short ID (default: 8)
     * @returns {Promise<Object>} Created short URL record
     */
    async createShortId(redirectUrl, body) {
        const { shortIdLength = 8 } = body?.options || {};

        // Validate input
        if (!redirectUrl || typeof redirectUrl !== "string") {
            throw new ApplicationError(
                "redirectUrl is required and must be a string",
                400,
            );
        }

        // Validate URL format (basic check)
        if (
            !redirectUrl.startsWith("http://") &&
            !redirectUrl.startsWith("https://")
        ) {
            throw new ApplicationError(
                "redirectUrl must start with http:// or https://",
                400,
            );
        }

        // Generate unique short ID
        const shortUrlId = nanoid(shortIdLength);

        // Create the entry in database
        const newShortUrl = await this.shortUrlModel.create({
            id: uuidv4(), // Generate UUID for primary key
            shortUrl: shortUrlId,
            redirectUrl: redirectUrl,
            visitHistory: [], // Initialize empty visit history
        });

        console.log("✅ Short URL created:", {
            id: newShortUrl.id,
            shortUrl: newShortUrl.shortUrl,
            redirectUrl: newShortUrl.redirectUrl,
        });

        return {
            id: newShortUrl.id,
            shortUrl: newShortUrl.shortUrl,
            redirectUrl: newShortUrl.redirectUrl,
            createdAt: newShortUrl.createdAt,
        };
    }

    /**
     * Get a short URL by its short ID and record the visit
     * @param {string} shortId - The short URL identifier
     * @param {Object} visitData - Optional visit metadata (userAgent, ipAddress, etc.)
     * @returns {Promise<Object>} Short URL record
     */
    async getShortUrl(shortId, visitData = {}) {
        const record = await this.shortUrlModel.findOne({
            where: { shortUrl: shortId },
        });

        if (!record) {
            throw new ApplicationError(`Short URL not found: ${shortId}`, 404);
        }

        // Record visit
        await this._recordVisit(shortId, visitData);

        return record;
    }

    /**
     * Record a visit to a short URL
     * @param {string} shortId - The short URL identifier
     * @param {Object} visitData - Visit metadata (userAgent, ipAddress, referrer, etc.)
     * @returns {Promise<Object>} Updated record with new visit
     */
    async _recordVisit(shortId, visitData = {}) {
        const record = await this.shortUrlModel.findOne({
            where: { shortUrl: shortId },
        });

        if (!record) {
            throw new ApplicationError(`Short URL not found: ${shortId}`, 404);
        }

        const visitEntry = {
            timestamp: new Date().toISOString(),
            userAgent: visitData.userAgent || null,
            ipAddress: visitData.ipAddress || null,
            referrer: visitData.referrer || null,
            ...visitData,
        };

        const visitHistory = JSON.parse(record.visitHistory) || [];
        const updatedHistory = Array.isArray(visitHistory)
            ? [...visitHistory]
            : [];
        updatedHistory.push(visitEntry);

        await this.shortUrlModel.update(
            { visitHistory: JSON.stringify(updatedHistory) },
            { where: { shortUrl: shortId } },
        );

        console.log(
            "📊 Visit recorded for:",
            shortId,
            "Total visits:",
            updatedHistory.length,
        );

        return record;
    }

    /**
     * Get visit history for a short URL
     * @param {string} shortId - The short URL identifier
     * @returns {Promise<Object>} Visit history with stats
     */
    async getVisitHistory(shortId) {
        const record = await this.shortUrlModel.findOne({
            where: { shortUrl: shortId },
            raw: true,
        });
        console.log("🚀 ~ ShortUrlModel ~ getVisitHistory ~ record:", record);

        if (!record) {
            throw new ApplicationError(`Short URL not found: ${shortId}`, 404);
        }

        const visits = JSON.parse(record.visitHistory) || [];
        return {
            shortUrl: record.shortUrl,
            redirectUrl: record.redirectUrl,
            totalVisits: visits.length,
            visits: visits,
        };
    }
}
