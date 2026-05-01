import { ApplicationError } from "../lib/errors.js";

/**
 * Helper that throws an error to trigger a 400 response if a
 * field is missing.
 * @param {Array<string>} requiredFields List of required fields
 * @param {any} body Body of the request
 */
function assertRequiredFields(requiredFields = [], body) {
  const missingFields = requiredFields.filter((field) => !body[field]);
  if (missingFields.length > 0) {
    throw new ApplicationError("Missing required fields", 400, {
      requiredFields,
      missingFields,
    });
  }
}

/**
 * Wrapper for routes. Does the following:
 * - Routes can be written as async functions
 * - Thrown errors get passed to the `next` callback
 * - Allows you to require fields in the request body
 *   (works only if body-parser is applied earlier) if
 *   options.requiredFields is present (must be an array)
 */
export function route(callback, options = {}) {
  return async (req, res, next) => {
    try {
      if (options.requiredFields) {
        assertRequiredFields(options.requiredFields, req.body);
      }
      await callback(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

export function successRoute(data) {
  if (data && data.error) {
    return {
      data: {},
      message: data.error.message,
      statusCode: data.error.errorCode,
    };
  }
  return {
    data: data,
    message: "Success",
    statusCode: 200,
  };
}

export function expressOkResponse(res, payload, payloadIsJSON, statusCode) {
  const retCode = statusCode | 200;
  if (payloadIsJSON) {
    res.status(retCode).json(payload);
    return;
  }
  res.status(retCode).send(payload);
}
