import { v1router } from "./v1/index.js";
import express from "express";
export const router = express.Router();

router.use("/v1", v1router);
