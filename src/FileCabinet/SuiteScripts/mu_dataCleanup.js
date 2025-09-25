/**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 */

define(['N/record', 'N/search', 'N/log', 'N/format'], (record, search, log, format) => {

    function each(params) {
        try {
            const customerId = params.id;

            const monthsAgo = new Date();
            monthsAgo.setMonth(monthsAgo.getMonth() - 12);

            const formattedDate = format.format({
                value: monthsAgo,
                type: format.Type.DATE
            });

            const transactionSearch = search.create({
                type: search.Type.TRANSACTION,
                filters: [
                    ['entity', 'anyof', customerId],
                    'AND',
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['trandate', 'onorafter', formattedDate]
                ],
                columns: ['internalid']
            });

            let hasRecentTransaction = false;
            transactionSearch.run().each(() => {
                hasRecentTransaction = true;
                return false;
            });

            log.debug('Transaction Check', `Customer: ${customerId}, hasRecentTransaction: ${hasRecentTransaction}`);

            if (!hasRecentTransaction) {
                record.submitFields({
                    type: record.Type.CUSTOMER,
                    id: customerId,
                    values: { isinactive: true }
                });

                log.audit('Customer Inactivated', `Customer ID: ${customerId}`);
            } else {
                log.debug('Skipped Customer', `Customer ID: ${customerId} still has recent transactions`);
            }
        } catch (e) {
            log.error('Error processing Customer', `Customer ID: ${params.id}, Error: ${e.message}`);
        }
    }

    return {
        each: each
    };
});