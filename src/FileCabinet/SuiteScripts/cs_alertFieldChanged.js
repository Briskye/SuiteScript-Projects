/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define([], () => {

    const fieldChanged = (context) => {

            const currentRecord = context.currentRecord;
            const fieldId = context.fieldId;

            if (fieldId === 'comments') {
                const newValue = currentRecord.getValue({
                    fieldId: 'comments'
                });

                console.log('Comments changed to: ' + newValue);
                
                alert('Comments changed to: ' + newValue);
            }
        }
        return {
            fieldChanged
        };
});

    