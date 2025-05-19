/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/search', 'N/record'], (search, record) => {

    function afterSubmit(context) {
        if (context.type !== context.UserEventType.CREATE) return;

        const newRecord = context.newRecord;
        const customerId = newRecord.id;

        // Create a new saved search for this specific customer
        const customerSearch = search.create({
            type: search.Type.CUSTOMER,
            filters: [
                ['internalid', 'anyof', customerId]
            ],
            columns: [
                'entityid',
                'email',
                'phone'
            ],
            title: `Auto-Created Search for Customer ${customerId}`,
            id: `customsearch_customer_${customerId}`
        });

        try {
            
            // Save the new saved search in NetSuite
            const savedSearchId = customerSearch.save();
            log.audit('Saved Search Created', `Saved Search ID: ${savedSearchId}`)
        }
        catch (e) {
            log.error('Error Saving Search', e.message);
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});