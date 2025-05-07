/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/log'], (log) => {

    function beforeSubmit(context) {
        try {
            if (context.type !== context.UserEventType.EDIT) 
                return;

            var contactRecord = context.newRecord;

            // Get the value of the 'firstname' field from the record.
            var firstName = contactRecord.getValue({ fieldId: 'firstname' });

            // Check if 'firstName' has a value and if it equals 'john' (case-insensitive).
            if (firstName && firstName.toLowerCase() === 'john') {

                // Set the 'firstname' field to 'John' with proper capitalization.
                contactRecord.setValue({
                    fieldId: 'firstname',
                    value: 'John'
                });
                // Set the 'lastname' field to 'Mendoza'.
                contactRecord.setValue({
                    fieldId: 'lastname',
                    value: 'Mendoza'
                });

                log.debug('Contact Updated', 'Firstname set to John, Lastname set to Mendoza');
            }
        }

        catch (e) {
            log.error('Error in beforeSubmit', e.message);
        }
    }
    
    return {
        beforeSubmit: beforeSubmit
    };
});