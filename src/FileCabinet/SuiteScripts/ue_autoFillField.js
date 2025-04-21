/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/log'], (log) => {

    const beforeSubmit = (context) => {
        if (context.type === context.UserEventType.CREATE || context.type === context.UserEventType.EDIT) {
            const customerRecord = context.newRecord;

            const companyName = customerRecord.getValue({ fieldId: 'companyname'});

            if (companyName && companyName.toLowerCase().includes('link')) {
                const defaultWebAddress = 'https://www.link.com';

                log.debug('Company name is "link"', 'Setting web address to ' + defaultWebAddress);

                customerRecord.setValue({
                    fieldId: 'url',
                    value: defaultWebAddress
                });
            }
        }
    };

    return {
        beforeSubmit
    };
});