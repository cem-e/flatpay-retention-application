import express from "express";
import * as customerController from "./customers.controller.js";

const router = express.Router();

router.get('/', customerController.getCustomerOverview);
router.get('/:customerId', customerController.getCustomerDetail);

export default router;
