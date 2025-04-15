/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/currentRecord'], (currentRecord) => {

    const fieldChanged = (context) => {
        const rec = currentRecord.get();
        const fieldId = context.fieldId;

        if (fieldId === 'entitystatus') {
            const status = rec.getText({ fieldId });
            alert('You selected: ' + status + '"')
        }
    };

    return {
        fieldChanged
    };
});