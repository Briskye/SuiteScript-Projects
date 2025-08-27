/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/record', 'N/log'], (search, record, log) => {

    /**
     * - Gathers all Sales Orders that are currently in "Pending Fulfillment" status
     * - These will be processed to create Item Fulfillments
     */

    const getInputData = () => {
        return search.create({
            type: search.Type.SALES_ORDER,
                filters: [
                ['status', 'anyof', 'SalesOrd:B'], // Status: Pending Fulfillment
                'AND',
                ['mainline', 'is', 'T'],
            ],
            columns: ['internalid']
        });
    };

    const map = (context) => {
        let result = JSON.parse(context.value);
        let salesOrderId = result.id;

        context.write({
            key: salesOrderId,
            value: salesOrderId
        });
    };

    /**
     * - Processes each Sales Order individually
     * - Transforms the Sales Order into an Item Fulfillment record and marks as Shipped
     */

    const reduce = (context) => {
        let salesOrderId = context.key;

        try {
            //Transform Sales Order to Item Fulfillment
            let fulfillment = record.transform({
                fromType: record.Type.SALES_ORDER,
                fromId: salesOrderId,
                toType: record.Type.ITEM_FULFILLMENT,
                isDynamic: true,
                defaultValues: {
                    inventorylocation : 8
                }
            });

            fulfillment.setValue({
                fieldId: 'shipstatus',
                value: 'C' // Mark as Shipped
            });

            let fulfillmentId = fulfillment.save();
            log.audit('Item Fulfillment Created', `SO ID: ${salesOrderId}, IF ID: ${fulfillmentId}`);
        } catch (e) {
            log.error('Error Creating Fulfillment', `SO ID: ${salesOrderId} - ${e.message}`);
        }
    };

    const summarize = (summary) => {
        log.audit('Summary', `Usage Consumed: ${summary.usage}`);
        log.audit('Summary', `Concurrency: ${summary.concurrency}`);
        log.audit('Summary', `Yields: ${summary.yields}`);

        if (summary.output) {
            summary.output.iterator().each((key, value) => {
                log.audit('Fulfilled Order', `SO ID: ${key}`);
                return true;
            });
        } else {
            log.audit('No Output', 'No sales orders were fulfilled');
        }

        if (summary.errors) {
            summary.errors.iterator().each((key, error, executionNo) => {
                log.error('Error', `SO ID: ${key}, Execution No: ${executionNo}, Error: ${error}`);
                return true;
            });
        } else {
            log.audit('No Errors', 'No errors occurred during execution');
        }
    };

    return {
        getInputData,
        map,
        reduce,
        summarize
    };
});