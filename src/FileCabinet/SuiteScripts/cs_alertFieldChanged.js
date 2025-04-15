/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/log'], (log) => {

    const fieldChanged = (context) => {
        try {
            const currentRecord = context.currentRecord;
            const fieldId = context.fieldId;

            if (fieldId === 'entitystatus') {
                const newValue = currentRecord.getText({
                    fieldId: 'entitystatus'
                });

                alert('Entity Status changed to: '+ newValue);
            }
        } catch (e) {
            log.error({
                title: 'Error in fieldChanged',
                details: e.message
            });
        }
    };

    return {
        fieldChanged
    };
});