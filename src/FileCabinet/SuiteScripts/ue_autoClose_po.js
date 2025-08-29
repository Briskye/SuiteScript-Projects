/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/record', 'N/log'], (record, log) => {

    function afterSubmit(context) {
        try {
            if (context.type !== context.UserEventType.CREATE &&
                context.type !== context.UserEventType.EDIT) {
                    return;
            }

            const poRecord = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: context.newRecord.id,
                isDynamic: false
            });

            // Get the current status of the PO
            const status = poRecord.getValue({ fieldId: 'status' });
            log.debug('PO Status', status);

            // If the status is not "Pending Bill", skip closing
            // This means items are not fully received yet
            if (!status || !status.includes('Pending Bill')) {
                log.debug('Skip Closing', 'PO not yet fully received');
                return;
            }

            // Get the number of item lines in the PO
            const lineCount = poRecord.getLineCount({ sublistId: 'item' });
            let allReceived = true; // Flag to track if all lines are fully received

            for (let i = 0; i < lineCount; i++) {
                // Get ordered quantity per line
                const qtyOrdered = poRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i
                }) || 0;

                // Get received quantity per line
                const qtyReceived = poRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantityreceived',
                    line: i
                }) || 0;

                log.debug(`Line ${i}`, `Ordered: ${qtyOrdered}, Received: ${qtyReceived}`);

                // If any line is not fully received, mark flag as false and break loop
                if (qtyReceived < qtyOrdered) {
                    allReceived = false;
                    break;
                }
            }

            // If all item lines are fully received, proceed to close them
            if (allReceived) {
                for (let i = 0; i < lineCount; i++) {
                    // Set 'isclosed' field to true for each line to close it
                    poRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'isclosed',
                        line: i,
                        value: true
                    });
                }

                // Save the updated PO record with closed lines
                poRecord.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });

                log.audit('PO Closed', `Purchase Order ID ${context.newRecord.id} closed successfully`);
            }

        } catch (e) {
            log.error('Error Auto-Closing PO', e.toString());
        }
    }

    return { afterSubmit };
});