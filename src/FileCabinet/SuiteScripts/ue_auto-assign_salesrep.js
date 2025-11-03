/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/search', 'N/record', 'N/log'], (search, record, log) => {

    const beforeSubmit = (context) => {
        try {
            const newRec = context.newRecord;

            if (context.type !== context.UserEventType.CREATE) return;

            // Get the location field from the sales order
            const locationId = newRec.getValue('location');
            if (!locationId) {
                log.audit('No Location Selected', 'Skipping Sales Rep Assignment.');
                return;
            }

            log.debug('Location Selected', `Location ID: ${locationId}`);

            // Define mapping between Location Internal IDs and Sales Rep Internal IDs
            const locationToRep = {
                8: 2,
                10: 289,
                default: 8
            };

            const repId = locationToRep[locationId] || locationToRep.default;

            newRec.setValue({
                fieldId: 'salesrep',
                value: repId
            });

            log.audit('Sales Rep Assigned', `Location ID: ${locationId} - Sales Rep ID: ${repId}`);
        } catch (e) {
            log.error('Error Assigning Sales Rep', e);
        }
    };

    return { beforeSubmit };
});