import BaseModel from "./BaseModel.js";

export default class ServerStatusModel extends BaseModel {
    constructor(connection) {
        super("", connection);
        // define all models, schemas, associations
    }
    // define methods
    async getServerStatus() {
        return { message: "Server is up & running" };
    }
}