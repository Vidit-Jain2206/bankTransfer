import express from "express";
import "dotenv/config";
import { connect } from "./db/index.js";

const port = process.env.PORT || 3000;
const app = express();

app.listen(port, () => {
  connect();
  console.log(`Server is running on port ${port}`);
});
