/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/log', 'N/ui/dialog'], (log,dialog) => {

    const fieldChanged = context => {
        try {
            const fieldId = context.fieldId;

            if (fieldId === 'subsidiary') {
                const currentRecord = context.currentRecord;
                const subsidiaryValue = currentRecord.getValue({ fieldId: 'subsidiary' });

                dialog.alert({
                    title: 'Subsidiary Changed',
                    message: `Subsidiary Changed to: ${subsidiaryValue}`
                });
                log.debug('Subsidiary Changed', `New Value: ${subsidiaryValue}`);
            }
        }
        catch (error) {
            log.error('Error in fieldChanged', error);
        }
    };

    return {
        fieldChanged
    };
});