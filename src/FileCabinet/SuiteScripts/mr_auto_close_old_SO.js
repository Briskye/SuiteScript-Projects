/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/record', 'N/log'], (search, record, log) => {

    const getInputData = () => {
        return search.create({
            type: search.Type.SALES_ORDER,
            filters: [
                ['status', 'noneof', 'SalesOrd:G', 'SalesOrd:H'],
                'AND',
                ['datecreated', 'onorbefore', 'daysago90']
            ],
            columns: ['internalid']
        });
    };

    const map = (context) => {
        const result = JSON.parse(context.value);
        context.write({
            key: result.id,
            value: result.id
        });
    };

    const reduce = (context) => {
        const soId = context.key;

        try {
            const soRec = record.load({
                type: record.Type.SALES_ORDER,
                id: soId
            });
            
            const lineCount = soRec.getLineCount({ sublistId: 'item' });

            for (let i = 0; i < lineCount; i++) {
                soRec.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'isclosed',
                    line: i,
                    value: true
                });
            }
            soRec.save();

            log.debug('Closed', `Sales Order ${soId} Successfully closed`);
        } catch (e) {
            log.error('Close Failed', e);
        }
    };

    return {
        getInputData,
        map,
        reduce
    };
});