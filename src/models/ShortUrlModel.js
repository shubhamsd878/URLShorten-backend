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
     * Get a short URL by its short ID
     * @param {string} shortId - The short URL identifier
     * @returns {Promise<Object>} Short URL record
     */
    async getShortUrl(shortId) {
        const record = await this.shortUrlModel.findOne({
            where: { shortUrl: shortId },
        });

        if (!record) {
            throw new ApplicationError(`Short URL not found: ${shortId}`, 404);
        }

        return record;
    }
}
