/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/ui/dialog'], (dialog) => {

    const fieldChanged = (context) => {

            const currentRecord = context.currentRecord;
            const fieldId = context.fieldId;

            if (fieldId === 'comments') {
                const newValue = currentRecord.getValue({
                    fieldId: 'comments'
                });

                console.log('Comments changed to: ' + newValue);
                
                dialog.alert({
                    title: 'Comments updated',
                    message: 'Comments field was changed to: ' + newValue
                });
                
            }
        }
        return {
            fieldChanged
        };
});

    