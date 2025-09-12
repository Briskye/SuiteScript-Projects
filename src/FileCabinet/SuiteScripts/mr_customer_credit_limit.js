/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/record'], (search, record) => {

    const getInputData = () => {
        return search.create({
            type: search.Type.CUSTOMER,
            filters: [
                ['creditlimit', 'greaterthan', 0],
                'AND',
                ['isinactive', 'is', 'F']
            ],
            columns: ['internalid', 'creditlimit', 'balance']
        });
    };

    const map = (context) => {
        const result = JSON.parse(context.value);
        const custId = result.id;

        const creditLimit = parseFloat(result.values.creditlimit) || 0;
        const balance = parseFloat(result.values.balance) || 0;

        if (balance > creditLimit) {
            context.write({
                key: custId,
                value: {
                    creditLimit: creditLimit,
                    balance: balance
                }
            });
        }
    };

    const reduce = (context) => {
        const custId = context.key;
        const details = JSON.parse(context.values[0]);

        try {
            record.submitFields({
                type: record.Type.CUSTOMER,
                id: custId,
                values: {
                    custentity_credit_limit_flag: true
                }
            });

            log.audit('Flagged Customer',
                `Customer ${custId} exceeds credit limit. Balance ${details.balance}, Limit: ${details.creditLimit}`
            );

        } catch (e) {
            log.error('Update Failed', `Customer ${custId}: ${e.message}`);
        }
    };

    return {
        getInputData,
        map,
        reduce
    };
});