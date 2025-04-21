/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/ui/dialog'], (dialog) => {

    const saveRecord = (context) => {
        const currentRecord = context.currentRecord;

        const myFieldValue = currentRecord.getValue({
            fieldId: 'parent'
        });

        if (!myFieldValue) {
            dialog.alert({
                title: 'Fill up this field',
                message: `Please fill out the required field: <b>Parent Company.</b>`
            })
            return false;
        }

        return true;
    };

    return {
        saveRecord
    };
});