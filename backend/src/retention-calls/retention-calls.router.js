import express from "express";
import * as retentionCallController from "./retention-calls.controller.js";

const router = express.Router();

router.get('/:customerId', retentionCallController.getRetentionCallsForCustomer);
router.post('/', retentionCallController.createRetentionCall);

export default router;
