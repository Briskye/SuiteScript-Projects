/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/log', 'N/ui/dialog'], (log,dialog) => {

    const fieldChanged = context => {
        try {
            const fieldId = context.fieldId;

            // Check if the changed field is 'subsidiary'
            if (fieldId === 'subsidiary') {
                const currentRecord = context.currentRecord;
                // Get the new value of the 'subsidiary' field
                const subsidiaryValue = currentRecord.getValue({ fieldId: 'subsidiary' });

                // Display an alert to the user showing the new value
                dialog.alert({
                    title: 'Subsidiary Changed',
                    message: `Subsidiary Changed to: ${subsidiaryValue}`
                });
                // Log the new value to the NetSuite script execution log
                log.debug('Subsidiary Changed', `New Value: ${subsidiaryValue}`);
            }
        }
        catch (error) {
            // If an error occurs, log it to the NetSuite script execution log
            log.error('Error in fieldChanged', error);
        }
    };

    return {
        fieldChanged
    };
});