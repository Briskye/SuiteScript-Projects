/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/currentRecord'],(currentRecord) => {

    const fieldChanged = (context) => {
        const currentRec = currentRecord.get();
        const fieldId = context.fieldId;

        if (fieldId === 'entitystatus') {
            const value = currentRec.getText({ fieldId });
            alert('You selected: ' + value)
        }
    };

    return {
        fieldChanged
    };
});