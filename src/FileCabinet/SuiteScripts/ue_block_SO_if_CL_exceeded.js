/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/search', 'N/error', 'N/log'], (search, error, log) => {

    const beforeSubmit = (context) => {
        try {
            const so = context.newRecord;

            // Only validate on create or edit
            if(![context.UserEventType.CREATE, context.UserEventType.EDIT].includes(context.type)) return;

            const customerId = so.getValue('entity');
            if (!customerId) return;

            const orderTotal = Number(so.getValue('total')) || 0;

            // Lookup customer's credit data
            const customerData = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: customerId,
                columns: ['balance', 'creditlimit', 'companyname']
            });

            const customerName = customerData.companyname || '(Unknown Customer)';
            const currentBalance = Number(customerData.balance) || 0;
            const creditLimit = Number(customerData.creditlimit) || 0;

            log.debug('Credit Check', {
                customer: customerName,
                balance: currentBalance,
                orderTotal: orderTotal,
                creditLimit: creditLimit
            });

            // Only validate if a credit limit is defined
            if (creditLimit > 0) {
                const projectedBalance = currentBalance + orderTotal;

                if (projectedBalance > creditLimit) {
                    throw error.create({
                        name: 'CREDIT_LIMIT_EXCEEDED',
                        message: `Customer "${customerName}" exceeds credit limit. \n\n` +
                            `Credit Limit: ${creditLimit.toFixed(2)}\n` +
                            `Current Balance: ${currentBalance.toFixed(2)}\n` +
                            `New Order Total: ${orderTotal.toFixed(2)}\n` +
                            `Projected Balance: ${projectedBalance.toFixed(2)}\n\n` +
                            `Please Review this customer's credit status before proceeding.`,
                        notifyOff: false
                    });
                }
            }

        } catch (e) {
            log.error('Credit Limit Validation Failed', e);
            throw e;
        }
    };

    return { beforeSubmit };
})