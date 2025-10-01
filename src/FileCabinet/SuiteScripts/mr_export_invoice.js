/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/file', 'N/log'], (search, file, log) => {

    function getInputData() {
        return search.create({
            type: search.Type.INVOICE,
            filters: [
                ['mainline', 'is', 'T']
            ],
            columns: [
                'tranid',
                'trandate',
                'entity',
                'status',
                'amount'
            ]
        });
    }

    function map(context) {
        const result = JSON.parse(context.value);

        const invoiceData = {
            id: result.id,
            tranid: result.values.tranid,
            trandate: result.values.trandate,
            customer: result.values.entity ? result.values.entity.text : '',
            status: result.values.status ? result.values.status.text: '',
            amount: result.values.amount
        };

        context.write({
            key: result.id,
            value: invoiceData
        });
    }

    function reduce(context) {
        const invoiceData = context.values.map(val => JSON.parse(val));
        context.write({
            key: context.key,
            value: invoiceData[0]
        });
    }

    function summarize(summary) {
        try {
            let allInvoices = [];

            summary.output.iterator().each((key, value) => {
                allInvoices.push(JSON.parse(value));
                return true;
            });

            const jsonFile = file.create({
                name: 'Invoice_Export_' + new Date().getTime() + '.json',
                fileType: file.Type.JSON,
                contents: JSON.stringify(allInvoices, null, 2),
                folder: 13740
            });

            const fileId = jsonFile.save();
            log.audit('Export Complete', 'File save with ID: ' + fileId);
            
        } catch (e) {
            log.error('Summarize Error', e.message);
        }
    }

    return { getInputData, map, reduce, summarize};
});