/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/ui/dialog'], (dialog) => {

    const fieldChanged = (context) => {

            const currentRecord = context.currentRecord;
            const fieldId = context.fieldId;

            // Check if the changed field is 'comments'
            if (fieldId === 'comments') {
                // Get the new value entered into the 'comments' field
                const newValue = currentRecord.getValue({
                    fieldId: 'comments'
                });

                // Show alert dialog that the field was updated
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

    