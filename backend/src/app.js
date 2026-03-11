import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import customerRouter from "./customers/customers.router.js";
import retentionCallRouter from "./retention-calls/retention-calls.router.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.join(__dirname, '..', '..', 'frontend');

app.use(cors());
app.use(express.json());
app.use(express.static(frontendDir));

app.use('/api/customers', customerRouter);
app.use('/api/retention-calls', retentionCallRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

export default app;
