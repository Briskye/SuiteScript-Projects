/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/record', 'N/search', 'N/log'], (record, search, log) => {
    
    function getOpenPeriodDate() {
        const periodSearch = search.create({
            type: 'accountingperiod',
            filters: [
                ['closed', 'is', 'F'], 'AND',
                ['isquarter', 'is', 'F'], 'AND',
                ['isyear', 'is', 'F']
            ],
            columns: [
                search.createColumn({ name: 'startdate', sort: search.Sort.ASC })
            ]
        });

        const result = periodSearch.run().getRange({ start: 0, end: 1 });

        if (!result || result.length === 0) {
            throw 'No open accounting period found!';
        }

        return result[0].getValue('startdate');
    }

    function assignInventoryDetail(inventoryDetail, itemId, qtyNeeded, locationId) {

        let isSerialized = false;

        const itemLookup = search.lookupFields({
            type: 'item',
            id: itemId,
            columns: ['isserialitem', 'islotitem']
        });

            isSerialized = itemLookup.isserialitem || false;

        let remaining = qtyNeeded;

        if (isSerialized) {

            const serialResults = search.create({
                type: 'inventorynumber',
                filters: [
                    ['item', 'anyof', itemId], 'AND',
                    ['location', 'anyof', locationId], 'AND',
                    ['available', 'greaterthan', 0]
                ],
                columns: [
                    'inventorynumber',
                    'available'
                ]
            }).run().getRange({ start: 0, end: 500 });

            for (let sr of serialResults) {

            const serial = sr.getValue('inventorynumber');
            const qtyAvail = Number(sr.getValue('available')) || 0;

            if (!serial || qtyAvail <= 0) continue;

            inventoryDetail.selectNewLine({
                sublistId: 'inventoryassignment'
            });

            inventoryDetail.setCurrentSublistValue({
                sublistId: 'inventoryassignment',
                fieldId: 'quantity',
                value: 1
            });

            inventoryDetail.setCurrentSublistValue({
                sublistId: 'inventoryassignment',
                fieldId: 'receiptinventorynumber',
                value: serial
            });

            inventoryDetail.commitLine({
                sublistId: 'inventoryassignment'
            });

            remaining -= 1;
            if (remaining <= 0) break;
        }

            return;
        }

            const results = search.create({
                type: 'inventorybalance',
                filters: [
                    ['item', 'anyof', itemId],
                    'AND',
                    ['location', 'anyof', locationId]
                ],
                columns: [
                    'binnumber',
                    'available'
                ]
            }).run().getRange({ start: 0, end: 100 });

            for (let r of results) {

            const qtyAvail = Number(r.getValue('quantityavailable')) || 0;
            if (qtyAvail <= 0) continue;

            const binId = r.getValue('binnumber');
            const assignQty = Math.min(remaining, qtyAvail);

            inventoryDetail.selectNewLine({
                sublistId: 'inventoryassignment'
            });

            if (binId) {
                inventoryDetail.setCurrentSublistValue({
                    sublistId: 'inventoryassignment',
                    fieldId: 'binnumber',
                    value: binId
                });
            }

            inventoryDetail.setCurrentSublistValue({
                sublistId: 'inventoryassignment',
                fieldId: 'quantity',
                value: assignQty
            });

            inventoryDetail.commitLine({
                sublistId: 'inventoryassignment'
            });

            remaining -= assignQty;
            if (remaining <= 0) break;
        }
    }

    const afterSubmit = (context) => {
        try {
            if (context.type !== context.UserEventType.APPROVE) {
                log.debug('Skipped', `Event Type: ${context.type}`);
                return;
            } 

            const soRec = context.newRecord;
            const soId = soRec.id;

            log.audit('SO Approved', `Sales Order ID: ${soId}`);


            const existingFulfillment = search.create({
                type: 'itemfulfillment',
                filters: [
                    ['createdfrom', 'is', soId]
                ],
                columns: ['internalid']
            }).run().getRange({ start: 0, end: 1 });

            if (existingFulfillment && existingFulfillment.length > 0) {
                log.audit('Already Fulfilled', `Item Fulfillment already exists for this SO.`);
                return;
            }

            const fulfillment = record.transform({
                fromType: record.Type.SALES_ORDER,
                fromId: soId,
                toType: record.Type.ITEM_FULFILLMENT,
                isDynamic: true
            });

            const validDate = getOpenPeriodDate();

            fulfillment.setValue({
                fieldId: 'trandate',
                value: new Date(validDate)
            });

            log.audit('Using Open Period Date', `Date: ${validDate}`);

            const itemCount = fulfillment.getLineCount({ sublistId: 'item' });

            for (let i = 0; i < itemCount; i++) {
                fulfillment.selectLine({ sublistId: 'item', line: i });

                const itemId = fulfillment.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item'
                });

                const locationId = fulfillment.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'location'
                });

                const qtyToFulfill = Number(fulfillment.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantityremaining'
                })) || 0;

                const requiresDetail = fulfillment.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'inventorydetailavail',
                });

                if (qtyToFulfill <= 0) {
                    fulfillment.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemreceive',
                        value: false
                    });
                    fulfillment.commitLine({ sublistId: 'item' });
                    continue;
                }

                if (requiresDetail) {

                    const inventoryDetail = fulfillment.getCurrentSublistSubrecord({
                        sublistId: 'item',
                        fieldId: 'inventorydetail'
                    });

                    assignInventoryDetail(inventoryDetail, itemId, qtyToFulfill, locationId);
                }

                fulfillment.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'itemreceive',
                    value: true
                });

                fulfillment.commitLine({ sublistId: 'item'});
            }

            const fulfillmentId = fulfillment.save();

            log.audit('Fulfillment Created', `Item Fulfillment ID ${fulfillmentId}`);

            
        } catch(e) {
            log.error('Error Creating Fulfillment', e);
        }
    };

    

    return { afterSubmit };
});