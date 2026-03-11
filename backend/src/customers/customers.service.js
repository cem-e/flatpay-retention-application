function getDaysSinceLastTransaction(lastTransactionAt, datasetAsOf) {
  if (!lastTransactionAt || !datasetAsOf) {
    return null;
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const lastTransactionDate = new Date(lastTransactionAt);
  const referenceDate = new Date(datasetAsOf);
  const elapsed = referenceDate.getTime() - lastTransactionDate.getTime();

  return Math.floor(elapsed / millisecondsPerDay);
}

function classifyCustomer(daysSinceLastTransaction) {
  if (daysSinceLastTransaction === null) {
    return 'inactive';
  }

  if (daysSinceLastTransaction > 30) {
    return 'inactive';
  }

  if (daysSinceLastTransaction > 7) {
    return 'at_risk';
  }

  return 'active';
}

function attachCustomerStatus(customer) {
  const daysSinceLastTransaction = getDaysSinceLastTransaction(
    customer.last_transaction_at,
    customer.dataset_as_of
  );

  const normalizedCustomer = {
    ...customer,
    days_since_last_transaction: daysSinceLastTransaction,
    status: classifyCustomer(daysSinceLastTransaction),
  };

  delete normalizedCustomer.dataset_as_of;

  return normalizedCustomer;
}

export {
  attachCustomerStatus,
  classifyCustomer,
};
