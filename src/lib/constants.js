import { getEnv } from "../lib/index.js";

export const TABLE_NAME = {
    SHORT_URL_TABLE: "short_urls"
};

export const ENVIRONMENT = getEnv("NODE_ENV");
