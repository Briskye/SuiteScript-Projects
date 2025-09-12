/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/email', 'N/runtime'], (search, email, runtime) => {

    const getInputData = () => {
        return search.create({
            type: search.Type.INVOICE,
            filters: [
                ['status', 'anyof', 'CustInvc:A'],
                'AND',
                ['duedate', 'onorbefore', 'today']
            ],
            columns: [
                'internalid',
                'entity',
                'tranid',
                'duedate',
                'total'
            ]
        });
    };

    const map = (context) => {
        const result = JSON.parse(context.value);
        const invoiceId = result.id;

        const data = {
            invoiceId: invoiceId,
            tranid: result.values.tranid,
            duedate: result.values.duedate,
            total: result.values.total,
            customerId: result.values.entity.value
        };

        context.write({
            key: data.customerId,
            value: data
        });
    };

    const reduce = (context) => {
        const customerId = context.key;
        const invoices = context.values.map(val => JSON.parse(val));

        const uniqueInvoices = {};
        invoices.forEach(inv => {
            uniqueInvoices[inv.invoiceId] = inv;
        });

        let body = 'Dear Customer, <br/><br/>The following invoices are overdue:<br/><ul>';
        Object.values(uniqueInvoices).forEach(inv => {
            body += `<li>Invoice #${inv.tranid} - Due: ${inv.duedate} - Amount: ${inv.total}</li>`;
        });
        body += '</ul><br/>Please make your payment at your earliest convenience.<br/><br/>Thank you.';

        try {
            const customerLookup = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: customerId,
                columns: ['email']
            });

            const customerEmail = customerLookup.email;

            if (!customerEmail) {
                log.error('No Email', `Customer ${customerId} has no email on record.`);
                return;
            }

            email.send({
                author: 718,
                recipients: customerEmail,
                subject: 'Overdue Invoice Reminder',
                body: body,
                relatedRecords: {
                    entityId: customerId
                }
            });

            log.audit('Email Sent', `Customer ${customerId} - ${Object.keys(uniqueInvoices).length} invoices sent to ${customerEmail}`);
        } catch (e) {
            log.error('Email Failed', `Customer ${customerId}: ${e.message}`);
        }
    };

    return {
        getInputData,
        map,
        reduce
    };

});