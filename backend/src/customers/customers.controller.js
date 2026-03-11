import * as customerModel from "./customers.model.js";
import * as customerService from "./customers.service.js";
import * as retentionCallModel from "../retention-calls/retention-calls.model.js";

async function getCustomerOverview(_req, res, next) {
  try {
    const customers = await customerModel.getCustomerOverview();
    const enrichedCustomers = customers.map(customerService.attachCustomerStatus);

    res.json(enrichedCustomers);
  } catch (error) {
    next(error);
  }
}

async function getCustomerDetail(req, res, next) {
  try {
    const customerId = Number(req.params.customerId);

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res.status(400).json({ message: 'Invalid customer id' });
    }

    const customer = await customerModel.getCustomerDetail(customerId);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const [dailyTrend, monthlyVolume, transactions, retentionCalls] = await Promise.all([
      customerModel.getCustomerDailyTrend(customerId),
      customerModel.getCustomerMonthlyVolume(customerId),
      customerModel.getCustomerTransactions(customerId),
      retentionCallModel.getRetentionCallsForCustomer(customerId),
    ]);

    const payload = {
      ...customerService.attachCustomerStatus(customer),
      dailyTrend,
      monthlyVolume,
      transactions,
      retentionCalls,
    };

    res.json(payload);
  } catch (error) {
    next(error);
  }
}

export {
  getCustomerOverview,
  getCustomerDetail,
};
