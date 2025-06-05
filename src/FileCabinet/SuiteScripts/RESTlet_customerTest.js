/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

define(['N/record', 'N/log'], (record, log) => {

    const get = (requestParams) => {
        
        try{
            log.debug('GET Request', requestParams);

            const customerId = requestParams.id;

            if(!customerId) {
                return JSON.stringify({ success: false, message: 'Missing customer ID'});
            }

            const customer = record.load({
                type: record.Type.CUSTOMER,
                id: customerId
            });

            return JSON.stringify({
                success: true,
                data: {
                    id: customer.id,
                    name: customer.getValue({ fieldId: 'altname' }),
                    email: customer.getValue({ fieldId: 'email' })
                }   
            });
        } catch (e) {
            return JSON.stringify({ success: false, message: e.message });
        }
    };

    return {
        get
    };
});