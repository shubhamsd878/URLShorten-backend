import express from "express";
import { route, successRoute } from "./routes/index.js";
import ServerStatusModel from "./models/ServerStatusModel.js";

const serverStatusModel = new ServerStatusModel();

export default function createRouter() {
  const router = express.Router();
  
  router.get("/", (req, res) => {
    res.send("Server is up & running");
  });
  
  router.get("/status", route(async (req, res) => {
    try {
      console.log("🚀 ~ serverStatusModel:", serverStatusModel?.getServerStatus)
      const response = await serverStatusModel.getServerStatus();
      console.log("🚀 ~ createRouter ~ response:", response)
      return res.send(successRoute(response));
    } catch (error) {

    }
  }));
  router.get(
    "/status",
    route(async (req, res) => {
      try {
        const response = await ServerStatusModel.getServerStatus();
        console.log("🚀 ~ createRouter ~ response:", response)
        return res.send(successRoute(response));
      } catch (error) {}
    }),
  );

  return router;
}
