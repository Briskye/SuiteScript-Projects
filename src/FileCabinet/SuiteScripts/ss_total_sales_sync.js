/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/search', 'N/record', 'N/log'], (search, record, log) => {

    const execute = () => {
        try {
            const salesSummarySearch = search.create({
                type: search.Type.INVOICE,
                filters: [
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['status', 'anyof', ['CustInvc:A', 'CustInvc:B']]
                ],
                columns: [
                    search.createColumn({
                        name: 'entity',
                        summary: search.Summary.GROUP
                    }),
                    search.createColumn({
                        name: 'amount',
                        summary: search.Summary.SUM
                    })
                ]
            });

            const results = salesSummarySearch.run().getRange({ start: 0, end: 1000 });

            log.audit('Sales Summary', `Found ${results.length} Customer(s) with sales data.`);

            results.forEach(result => {
                const customerId = result.getValue({ name: 'entity', summary: search.Summary.GROUP });
                const totalSales = parseFloat(result.getValue({ name: 'amount', summary: search.Summary.SUM })) || 0;

                try {
                    record.submitFields({
                        type: record.Type.CUSTOMER,
                        id: customerId,
                        values: {
                            custentity_total_sales: totalSales
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    
                    log.debug('Customer Updated', {
                        customerId,
                        totalSales
                    });
                } catch (updateError) {
                    log.error('Failed to Update Customer', {
                        customerId,
                        error: updateError
                    });
                }
            });

            log.audit('Process Complete', 'All customer totals updated successfully.');
        } catch (e) {
            log.error('Script Error', e);
        }
    };

    return { execute };
});