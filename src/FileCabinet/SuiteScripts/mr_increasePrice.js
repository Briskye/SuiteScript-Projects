/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/record', 'N/log'], (search, record, log) => {

    function getInputData() {
        
        return search.create({
            type: search.Type.INVENTORY_ITEM,
            filters: [
                ['isinactive', 'is', 'F']
            ],
            columns: ['internalid', 'baseprice']
        });
    }

    function map(context) {
    const searchResult = JSON.parse(context.value);
    const itemId = searchResult.id;

    try {
        const itemRec = record.load({
            type: record.Type.INVENTORY_ITEM,
            id: itemId
        });

        const lineCount = itemRec.getLineCount({ sublistId: 'price1' });

        for (let i = 0; i < lineCount; i++) {
            const priceLevel = itemRec.getSublistText({
                sublistId: 'price1',
                fieldId: 'pricelevel',
                line: i
            });

            if (priceLevel === 'Base Price' || priceLevel === 'Standard Price') {
                let oldPrice = parseFloat(
                    itemRec.getSublistValue({
                        sublistId: 'price1',
                        fieldId: 'price_1_',
                        line: i
                    })
                ) || 0;

                let newPrice = parseFloat((oldPrice * 1.10).toFixed(2));

                itemRec.setSublistValue({
                    sublistId: 'price1',
                    fieldId: 'price_1_',
                    line: i,
                    value: newPrice
                });

                log.audit(
                    'Price Updated',
                    `Item ${itemId}: ${oldPrice} to ${newPrice}`
                );
            }
        }

            itemRec.save();

        } catch (e) {
            log.error(`Error updating Item ${itemId}`, e.message);
        }
    }

    function reduce(context) {
        // Not needed
    }

    function summarize(summary) {
        log.audit('Usage Consumed', summary.usage);
        log.audit('Concurrency', summary.concurrency);

        if (summary.errors && summary.errors.iterator) {
            summary.errors.iterator().each((key, error) => {
                log.error(`Error for Key: ${key}`, error);
                return true;
            });

        } else {
            log.audit('No errors encountered', '');
        }
    }

    return {
        getInputData,
        map,
        reduce,
        summarize
    };
});