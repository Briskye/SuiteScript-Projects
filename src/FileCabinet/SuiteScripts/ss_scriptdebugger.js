/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/record','N/log'], (record, log) => {

    function execute() {
        const soId = 10515; // change as needed

        log.debug('DEBUG', `Transforming SO ${soId} (NO SAVE)`);

        try {
            const ifRec = record.transform({
                fromType: record.Type.SALES_ORDER,
                fromId: soId,
                toType: record.Type.ITEM_FULFILLMENT,
                isDynamic: true
            });

            const lineCount = ifRec.getLineCount({ sublistId: 'item' });

            for (let i = 0; i < lineCount; i++) {

                ifRec.selectLine({ sublistId: 'item', line: i });

                const data = {
                    line: i,
                    item: ifRec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'item' }),
                    qtyRemaining: ifRec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'quantityremaining' }),
                    location: ifRec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'location' }),
                    needsDetail: ifRec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'inventorydetailavail' })
                };

                let hasDetail = false;
                try {
                    const detail = ifRec.getCurrentSublistSubrecord({
                        sublistId: 'item',
                        fieldId: 'inventorydetail'
                    });

                    if (detail) {
                        hasDetail = true;
                        const assignCount = detail.getLineCount({ sublistId: 'inventoryassignment' });
                        data.inventoryDetailLines = assignCount;

                        let assignments = [];
                        for (let x = 0; x < assignCount; x++) {
                            detail.selectLine({ sublistId: 'inventoryassignment', line: x });
                            assignments.push({
                                qty: detail.getCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'quantity'
                                }),
                                issue: detail.getCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'issueinventorynumber'
                                }),
                                bin: detail.getCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'binnumber'
                                })
                            });
                        }
                        data.assignments = assignments;
                    }
                } catch (e) {
                    data.inventoryDetailError = e.message;
                }

                log.debug(`LINE ${i}`, JSON.stringify(data));
                ifRec.commitLine({ sublistId: 'item' });
            }

        } catch (err) {
            log.error('TRANSFORM ERROR', err.message);
        }
    }

    return { execute };
});
