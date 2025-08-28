/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/record', 'N/log'], (search, record, log) => {


     // - Fetches all Sales Orders with status "Pending Billing"
    const getInputData = () => {
        return search.create({
            type: search.Type.SALES_ORDER,
            filters: [
                ['status', 'anyof', 'SalesOrd:F'], // Pending Billing
                'AND',
                ['mainline', 'is', 'T']
            ],
            columns: ['internalid']
        });
    };

    // - Runs once per search rusult (Sales Order)
    const map = (context) => {
        let result = JSON.parse(context.value);
        let salesOrdId = result.values.internalid.value;

        if (salesOrdId) {
            // Pass Sales Order ID to reduce stage
            context.write({
                key: salesOrdId,
                value: salesOrdId
            });
        } else {
            log.error('Sales Order ID Missing', JSON.stringify(result));
        }
    };

    /**
     * - Runs once for each unique Sales Order ID from map stage
     * - Transforms Sales Order into Invoice
     * - Sets Location & Approval Status
     */
    const reduce = (context) => {
        let salesOrdId = context.key;
 
        try{
            let invoice = record.transform({
                fromType: record.Type.SALES_ORDER,
                fromId: salesOrdId,
                toType: record.Type.INVOICE,
                isDynamic: true
            });

            invoice.setValue({
                fieldId: 'location',
                value: 8
            });

            invoice.setValue({
                fieldId: 'approvalstatus',
                value: 2
            });

            let invoiceId = invoice.save();
            log.audit('Invoice Created', `SO ID: ${salesOrdId}, INV ID: ${invoiceId}`);

        } catch (e) {
            log.error('Error Creating Invoice', `SO ID: ${salesOrdId} - ${e.message}`);
        }
    };

    const summarize = (summary) => {
        log.audit('Summary', `Usage Consumed: ${summary.usage}`);
        log.audit('Summary', `Concurrency Consumed: ${summary.concurrency}`);
        log.audit('Summary', `Yields Consumed: ${summary.yields}`);

        if (summary.output) {
            summary.output.iterator().each((key, value) => {
                log.audit('Invoiced Order', `SO ID: ${key}`);
                return true;
            });
        }

        if (summary.errors) {
            summary.errors.iterator().each((key, error, executionNo) => {
                log.error('Error', `SO ID: ${key}, Execution No: ${executionNo}, Error: ${error}`);
                return true;
            });
        }
    };

    return {
        getInputData,
        map,
        reduce,
        summarize
    };
});