import fs from "fs";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import customerRouter from "./customers/customers.router.js";
import retentionCallRouter from "./retention-calls/retention-calls.router.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistDir = path.join(__dirname, "..", "..", "frontend", "dist");
const frontendIndexPath = path.join(frontendDistDir, "index.html");
const hasFrontendBuild = fs.existsSync(frontendIndexPath);

app.use(cors());
app.use(express.json());

if (hasFrontendBuild) {
  app.use(express.static(frontendDistDir));
}

app.use('/api/customers', customerRouter);
app.use('/api/retention-calls', retentionCallRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.get('*', (_req, res) => {
  if (!hasFrontendBuild) {
    return res.status(404).json({ message: "Frontend build not found" });
  }

  res.sendFile(frontendIndexPath);
});

export default app;
