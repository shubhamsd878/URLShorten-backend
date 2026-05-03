/* eslint-disable prettier/prettier */
// import { API_URL_ROOT } from "./constant.js";
import axios from "axios";
import { ApplicationError, Logger } from "./";
import * as https from "https";
import { ENVIRONMENT } from "./constants";
import fs from "fs/promises";

import { config } from "./config";
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});
export async function postgraphql(url, postData, timeout = 3000) {
    let postConfig = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    const httpClient = axios.create();
    httpClient.defaults.timeout = timeout;
    return await httpClient.post(url, postData, postConfig);
}

function makeLower(headers) {
    const head = {};
    for (const key in headers) {
        if (headers.hasOwnProperty(key)) {
            head[key.toLowerCase()] = headers[key];
        }
    }
    return head;
}

export const executeWebRequest = async (
    baseURL,
    url,
    method,
    passThruHeaders,
    payload,
    jsonBody = true,
    queryParams,
    // maxRetries = 1
) => {
    try {
        // const DEFAULT_TIMEOUT = 10000; // 10 seconds
        // const MAX_RETRIES = maxRetries;
        const headers = makeLower(passThruHeaders);
        const contentType = headers["content-type"];
        const authorization = headers["authorization"];
        const request = {
            baseURL,
            url,
            method,
            headers,
            // timeout: DEFAULT_TIMEOUT // Set a default timeout
        };
        if (queryParams) request.params = queryParams;
        if (payload && ["POST", "PUT"].includes(method)) {
            const body = jsonBody ? JSON.stringify(payload) : payload;
            request.data = body;
            // Logger.info('request payload', body);
        }
        Logger.info(
            "==================================================================",
        );
        Logger.info("request object in executeWebRequest: ", request);
        ENVIRONMENT === "development" && Object.assign(request, { httpsAgent });

        // let retries = 0;

        // while (retries < MAX_RETRIES) {
        // try {
        const res = await axios.request(request);
        return res.data;
        // } catch (error) {
        // retries += 1;

        // if (retries < MAX_RETRIES) {
        // Logger.warn(`Retrying request (${retries}/${MAX_RETRIES}) after error:`, error.message);
        // } else {
        // throw error;
        // }
        // }
        // }
    } catch (error) {
        Logger.error("Error in executeWebRequest:==>", error?.response?.data);
        if (error?.response?.data?.error?.length) {
            return error?.response?.data;
        }
        if (
            error.response &&
            error.response.data &&
            error.response.data.statusCode &&
            error.response.data.message
        ) {
            throw new ApplicationError(
                error.response.data.message,
                error.response.data.statusCode,
            );
        }
        throw error?.response?.data || error;
    }
};

export const executeGetRequest = async (
    baseURL,
    url,
    passThruHeaders,
    queryParams,
    // maxRetries = 1
) => {
    try {
        const headers = makeLower(passThruHeaders);
        const request = {
            baseURL,
            url,
            method: "GET",
            headers,
            responseType: "arraybuffer",
        };

        if (queryParams) request.params = queryParams;

        Logger.info("request object in executeGetRequest: ", request);

        ENVIRONMENT === "development" && Object.assign(request, { httpsAgent });

        const res = await axios.request(request);
        return res.data;
    } catch (error) {
        Logger.error("Error in executeGetRequest:==>", error?.response?.data);
        if (error?.response?.data?.error?.length) {
            return error?.response?.data;
        }
        if (
            error.response &&
            error.response.data &&
            error.response.data.statusCode &&
            error.response.data.message
        ) {
            throw new ApplicationError(
                error.response.data.message,
                error.response.data.statusCode,
            );
        }
        throw error?.response?.data || error;
    }
};

export async function uploadImageToNotbot(imageBase64, whatsappFileType) {
    const apiUrl = `${config[ENVIRONMENT].WHATSAPP_URL}/v1/media`;
    const apiKey = config[ENVIRONMENT].WHATSAPP_API_KEY;

    const tempDir = "./temporary";
    const fileExtension = whatsappFileType.split("/")[1];
    const filePath = `./temporary/temp.${fileExtension}`;
    try {
        // Decode base64 image data
        const buffer = Buffer.from(imageBase64, "base64");
        await fs.mkdir(tempDir, { recursive: true });
        // Save the image to a temporary file
        await fs.writeFile(filePath, buffer); // Use fs.promises.writeFile
        // Read the saved image file
        const imageData = await fs.readFile(filePath);

        // Make the API request using axios
        const response = await axios.post(apiUrl, imageData, {
            headers: {
                "API-KEY": apiKey,
                "Content-Type": whatsappFileType,
            },
        });

        // Log the response from the server
        Logger.info("uploadImageToNotbot", response.data);

        // Clean up the temporary file
        await fs.unlink(filePath); // Use fs.promises.unlink
        await fs.rmdir(tempDir);
        return response.data;
    } catch (error) {
        await fs.unlink(filePath); // Use fs.promises.unlink
        await fs.rmdir(tempDir);
        Logger.error("Error uploading image to Notbot:", error.message);
    }
}
//Post call
export async function post(url, postData, headers, timeout = 6000) {
    let postConfig = {
        headers: headers,
    };
    const httpClient = axios.create();
    httpClient.defaults.timeout = timeout;
    return await httpClient.post(url, postData, postConfig);
}

//Put call
export async function put(url, postData, headers, timeout = 3000) {
    let postConfig = {
        headers: headers,
    };
    const httpClient = axios.create();
    httpClient.defaults.timeout = timeout;
    return await httpClient.put(url, postData, postConfig);
}

//Get call
export async function get(url, headers, timeout = 6000) {
    let getConfig = {
        headers: headers,
    };
    const httpClient = axios.create();
    httpClient.defaults.timeout = timeout;
    return await httpClient.get(url, getConfig);
}
