/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record'], (record) => {

    function afterSubmit(context) {
        try {
            if (context.type !== context.UserEventType.EDIT) return;

            const newRecord = context.newRecord;
            const oldRecord = context.oldRecord;

            const newStatus = newRecord.getValue({ fieldId: 'approvalstatus' });
            const oldStatus = oldRecord.getValue({ fieldId: 'approvalstatus' });

            if (oldStatus !== '2' && newStatus === '2') {
                log.debug('PO Approved', `PO ${newRecord.id} is now approved. Setting approval date.`);

                const po = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: newRecord.id,
                    isDynamic: false
                });

                po.setValue({
                    fieldId: 'custbody_approval_date',
                    value: new Date()
                });

                po.save();
            }
        } catch (e) {
            log.error('Error in afterSubmit', e);
        }
    }

    return {
        afterSubmit
    };
});