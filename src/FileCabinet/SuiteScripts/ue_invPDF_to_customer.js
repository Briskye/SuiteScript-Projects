/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/email', 'N/render', 'N/record'], (email, render, record) => {

    function afterSubmit(context) {
        if (context.type !== context.UserEventType.CREATE) return;

        const invoiceId = context.newRecord.id;

        try {
            const fileObj = render.transaction({
                entityId: invoiceId,
                printMode: render.PrintMode.PDF
            });

            const customerId = context.newRecord.getValue('entity');
            const recipientEmail = record.load({
                type: record.Type.CUSTOMER,
                id: customerId
            }).getValue('email');

            if (recipientEmail) {
                email.send({
                    author: 718,
                    recipients: recipientEmail,
                    subject: 'Your Invoice from Company',
                    body: 'You received an invoice look at the attachment below.',
                    attachments: [fileObj]
                });
            }
        } catch (e) {
            log.error('Email Invoice Error', e);
        }
    }

    return {
        afterSubmit
    };
});