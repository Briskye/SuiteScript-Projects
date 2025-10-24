/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/search', 'N/record', 'N/runtime', 'N/log'], (search, record, runtime, log) => {

    const execute = () => {
        try {
            const script = runtime.getCurrentScript();
            let processedCount = 0;

            const itemSearch = search.create({
                type: search.Type.INVENTORY_ITEM,
                filters: [
                    ['isinactive', 'is', 'F'],
                ],
                columns: [
                    search.createColumn({ name: 'internalid', sort: search.Sort.ASC }),
                    'itemid',
                    'quantityavailable'
                ]
            });

            const pagedData = itemSearch.runPaged({ pageSize: 100 });

            pagedData.pageRanges.forEach(pageRange => {
                const page = pagedData.fetch({ index: pageRange.index });

                page.data.forEach(result => {
                    const itemId = result.getValue('internalid');
                    const itemName = result.getValue('itemid');
                    const qtyAvail = result.getValue('quantityavailable') || 0;

                    try {
                        record.submitFields({
                            type: record.Type.INVENTORY_ITEM,
                            id: itemId,
                            values: { custitem_stock_summary: qtyAvail },
                            options: { ignoreMandatoryFields: true }
                        });

                        log.debug('Item Updated', `${itemName} -> Available Qty: ${qtyAvail}`);
                        processedCount++;
                    } catch (updateErr) {
                        log.error('Error Updating Item', {
                            itemId,
                            itemName,
                            message: updateErr.message
                        });
                    }
                    
                });
            });

        } catch (e) {
            log.error('Script Error', e);
        }
    }

    return { execute };
});