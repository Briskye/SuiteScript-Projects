/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */

define(['N/runtime', 'N/search', 'N/record', 'N/log', 'N/task'], (runtime, search, record, log, task) => {

    const USAGE_LIMIT = 1000;

    function execute(context) {
        log.debug('Scheduled Fulfillment Manager', 'Starting Execution...');

        try {
            const salesOrders = getEligibleSalesOrders();
            let fulfillmentCount = 0;

            for (let salesOrder of salesOrders) {

                if (runtime.getCurrentScript().getRemainingUsage() < USAGE_LIMIT) {
                    log.audit('Rescheduling', `Remaining usage critical. Successfully fulfilled ${fulfillmentCount} orders. Rescheduling...`);
                    rescheduleScript();
                    break;
                }

                try {
                    createFulfillmentFromSalesOrder(salesOrder.id);
                    fulfillmentCount++;
                } catch (e) {
                    log.error(`Fulfillment Failed for SO ID ${salesOrder.id}`, e.message || e);
                }
            }

            log.audit('Execution Complete', `Total fulfilled: ${fulfillmentCount}`);
        } catch (e) {
            log.error('Fatal Error', e.message || e);
        }
    }

    function getEligibleSalesOrders() {
        const results = [];
        const soSearch = search.create({
            type: search.Type.SALES_ORDER,
            filters: [
                ['status', 'anyof', 'SalesOrd:B'],
                'AND',
                ['mainline', 'is', 'T']
            ],
            columns: ['internalid', 'tranid']
        });

        soSearch.run().each(result => {
            results.push({
                id: result.getValue({ name: 'internalid' }),
                tranid: result.getValue({ name: 'tranid' })
            });
            return true;
        });

        log.debug('Sales Orders Found', results.length);
        return results;
    }

    function getFirstOpenPeriodDate() {
        const periodSearch = search.create({
            type: 'accountingperiod',
            filters: [
                ['closed', 'is', 'F'],
                'AND',
                ['isquarter', 'is', 'F'],
                'AND',
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

        const item = search.lookupFields({
            type: search.Type.ITEM,
            id: itemId,
            columns: ['isserialitem', 'islotitem']
        });

        let remaining = qtyNeeded;

        if (item && item.isserialitem) {
            const serialResults = search.create({
                type: 'inventorynumber',
                filters: [
                    ['item', 'anyof', itemId],
                    'AND',
                    ['location', 'anyof', locationId],
                    'AND',
                    ['available', 'greaterthan', 0]
                ],
                columns: ['inventorynumber', 'available']
            }).run().getRange({ start: 0, end: qtyNeeded });

            for (let sr of serialResults) {
                const serial = sr.getValue('inventorynumber');
                const avail = Number(sr.getValue('available')) || 0;
                if (!serial || avail <= 0) continue;

                inventoryDetail.selectNewLine({ sublistId: 'inventoryassignment' });

                inventoryDetail.setCurrentSublistValue({
                    sublistId: 'inventoryassignment',
                    fieldId: 'issueinventorynumber',
                    value: serial
                });

                inventoryDetail.setCurrentSublistValue({
                    sublistId: 'inventoryassignment',
                    fieldId: 'quantity',
                    value: 1
                });

                inventoryDetail.commitLine({ sublistId: 'inventoryassignment' });

                remaining -= 1;
                if (remaining <= 0) break;
            }

            if (remaining > 0) {
                log.error('Serials Insufficient', `Item ${itemId} - needed ${qtyNeeded} but assigned ${qtyNeeded - remaining}`);
            }

            return remaining <= 0;
        }

        const bins = search.create({
            type: 'inventorybalance',
            filters: [
                ['item', 'anyof', itemId],
                'AND',
                ['location', 'anyof', locationId]
            ],
            columns: ['binnumber', 'available']
        }).run().getRange({ start: 0, end: 100 });

        for (let b of bins) {
            let available = Number(b.getValue('available')) || 0;
            if ( available <= 0) continue;

            const assignQty = Math.min(available, remaining);

            inventoryDetail.selectNewLine({ sublistId: 'inventoryassignment' });

            const binId = b.getValue('binnumber');

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

            inventoryDetail.commitLine({ sublistId: 'inventoryassignment' });

            remaining -= assignQty;

            if (remaining <= 0) break;
        }

        if (remaining > 0) {
            log.error('Bins Insufficient', `Item ${itemId} - needed ${qtyNeeded} but assign ${qtyNeeded - remaining}`);
        }

        return remaining <= 0;
    }

    function createFulfillmentFromSalesOrder(salesOrderId) {
        log.debug('Creating Fulfillment for SO', salesOrderId);

        const fulfillment = record.transform({
            fromType: record.Type.SALES_ORDER,
            fromId: salesOrderId,
            toType: record.Type.ITEM_FULFILLMENT,
            isDynamic: true
        });

        const openDate = getFirstOpenPeriodDate();
        fulfillment.setValue({
            fieldId: 'trandate',
            value: new Date(openDate)
        });

        const lineCount = fulfillment.getLineCount({ sublistId: 'item' });
        for (let i = 0; i < lineCount; i++) {

            fulfillment.selectLine({ sublistId: 'item', line: i });

            const qty = Number(fulfillment.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantityremaining'
            })) || 0;

            const itemId = fulfillment.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item'
            });

            let locationId = fulfillment.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'location'
            });
            
            if (!locationId) {
                locationId = fulfillment.getValue({ fieldId: 'location' });
            }

            const needsDetail = fulfillment.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'inventorydetailavail'
            });

            if (needsDetail && qty > 0) {
                
                const inventoryDetail = fulfillment.getCurrentSublistSubrecord({
                    sublistId: 'item',
                    fieldId: 'inventorydetail'
                });

                if (!inventoryDetail) {
                    throw new Error (`Missing inventorydetail subrecord for SO ${salesOrderId} line ${i + 1}`);
                }

                const success = assignInventoryDetail(inventoryDetail, itemId, qty, locationId);

                if (!success) {
                    throw new Error(`Inventory assignment failed for item ${itemId} on SO ${salesOrderId}`);
                }
            }

            fulfillment.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'itemreceive',
                value: qty > 0
            });

            fulfillment.commitLine({ sublistId: 'item' });
        }

        const fulfillmentId = fulfillment.save();

        log.audit('Fulfilled Successfully', `SO: ${salesOrderId} - IF: ${fulfillmentId}`);
    }

    function rescheduleScript() {
        const currentScript = runtime.getCurrentScript();
        const scriptTask = task.create({
            taskType: task.TaskType.SCHEDULED_SCRIPT,
            scriptId: currentScript.id,
            deploymentId: currentScript.deploymentId,
        });
        scriptTask.submit();
    }

    return { execute };
});