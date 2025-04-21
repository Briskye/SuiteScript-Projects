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
            var firstName = contactRecord.getValue({ fieldId: 'firstname' });

            if (firstName && firstName.toLowerCase() === 'john') {

                contactRecord.setValue({
                    fieldId: 'firstname',
                    value: 'John'
                });

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