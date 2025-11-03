/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/record', 'N/log'], (record, log) => {

    const DISCOUNT_THRESHOLD = 50000;
    const DISCOUNT_PERCENT = 0.05;
    const DISCOUNT_ITEM_ID = 164; // Tempo

    const beforeSubmit = (context) => {
        try {
            const rec = context.newRecord;

            if(![context.UserEventType.CREATE, context.UserEventType.EDIT].includes(context.type)) return;

            const total = Number(rec.getValue('total')) || 0;
            log.debug('Sales Order Total', total);

            if (total <= DISCOUNT_THRESHOLD) {
                log.debug('No Discount Applied', `Total ${total} is below threshold ${DISCOUNT_THRESHOLD}.`);
                return;
            }

            const recId = rec.id;
            const recType = rec.type;

            const dynamicRec = record.load({
                type: recType,
                id: recId,
                isDynamic: true
            });

            const lineCount = dynamicRec.getLineCount({ sublistId: 'item' });
            let discountAlreadyApplied = false

            for (let i = 0; i < lineCount; i++) {
                const itemId = dynamicRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });
                if (itemId == DISCOUNT_ITEM_ID) {
                    discountAlreadyApplied = true;
                    break;
                }
            }

            if (discountAlreadyApplied) {
                log.audit('Discount Exists', 'Discount line already applied. Skipping');
                return;
            }

            const discountAmount = -(total * DISCOUNT_PERCENT);

            dynamicRec.selectNewLine({ sublistId: 'item' });
            dynamicRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: DISCOUNT_ITEM_ID });
            dynamicRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: 1 });
            dynamicRec.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: discountAmount });
            dynamicRec.commitLine({ sublistId: 'item' });

            dynamicRec.save({ enableSourcing: false, ignoreMandatoryFields: true});

            log.audit('Discount Applied', `Discount of ${DISCOUNT_PERCENT * 100}% applied. Amount: ${discountAmount}`);
        } catch (e) {
            log.error('Error Applying Discount', e);
        }
    };

    return { beforeSubmit };
});