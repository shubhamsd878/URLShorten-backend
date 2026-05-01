import express from "express";
import "dotenv/config";
import createRouter from "./router.js";

const app = express();
const port = process.env.NODE_PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`Request entered on ${req.method} - ${req.path}`);
    next();
});

app.get("/", (req, res) => {
    res.send("<>Server is up & running<>");
});

app.use("/", createRouter());

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
