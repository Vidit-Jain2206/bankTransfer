import express from "express";
import { getOptions } from "../../controller/money.controller.js";

export const v1router = express.Router();

v1router.get("/options", getOptions);
