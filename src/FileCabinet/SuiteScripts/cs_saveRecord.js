/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/ui/dialog'], (dialog) => {

    const saveRecord = (context) => {
        const currentRecord = context.currentRecord;

        // Retrieve the value of the 'parent' field
        const myFieldValue = currentRecord.getValue({
            fieldId: 'parent'
        });

        // Check if the 'parent' field is empty
        if (!myFieldValue) {

            // Show an alert dialog prompting the user to fill in the required field
            dialog.alert({
                title: 'Fill up this field',
                message: `Please fill out the required field: <b>Parent Company.</b>`
            })

            // Prevent the record from being saved
            return false;
        }

        // Allow the record to be saved if validation passes
        return true;
    };

    return {
        saveRecord
    };
});