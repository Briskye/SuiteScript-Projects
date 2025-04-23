/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/currentRecord', 'N/ui/dialog'], function(currentRecord, dialog) {

    function clearAllFields() {
        const rec = currentRecord.get();
        // Field IDs i will clear
        const fieldIds = ['entityid', 'lastname', 'firstname', 'title', 'email'];

        // To set the values to blank
        fieldIds.forEach(function(fieldId) {
            try {
                rec.setValue({
                    fieldId: fieldId,
                    value: ''
                });
            }
            catch (e) {
                console.log('Could not clear field:', fieldId, '-', e.message);
            }
        });
        // Alert when Fields are cleared
        dialog.alert({
            title: 'Field Cleared!',
            message: 'You successfully cleared selected fields'
        });
    }

    function pageInit(context) {
        // I use pageInit to be able to upload this file to file cabinet in netsuite
        console.log('Client Script Loaded')
    }

    return {
        pageInit: pageInit,
        clearAllFields: clearAllFields
    };
});