/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/error', 'N/log'], (error, log) => {

    function beforeSubmit(context) {
        try {
            if (context.type !== context.UserEventType.DELETE) return;

            const rec = context.newRecord;

            // Prevent deletion of Approved Purchase Orders
            if (rec.type === 'purchaseorder') {
                const status = rec.getValue ({ fieldId: 'status' });

                if (status === 'Pending Billing' || status === 'Pending Receipt') {
                    throw error.create({
                        name: 'DELETE_BLOCKED',
                        message: 'You cannot delete this Purchase Order because it is already approved or processed.',
                        notifyOff: false
                    });
                }
            }
        } catch (e) {
            log.error('Deletion Blocked', e.toString());
            throw e;
        }
    }

    return { beforeSubmit };
});