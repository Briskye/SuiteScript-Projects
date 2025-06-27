/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/record', 'N/email', 'N/runtime', 'N/log'], (record, email, runtime, log) => {

    const beforeSubmit = (context) => {
        if (context.type !== context.UserEventType.EDIT) return;

        const newRec = context.newRecord;
        const oldRec = context.oldRecord;

        const newStatus = newRec.getValue('custrecord_wfs_status');
        const oldStatus = oldRec.getValue('custrecord_wfs_status');

        if (newStatus === '1' && (oldStatus === '2' || oldStatus === '3')) {
            throw new Error('Status cannot be changed back to Pending after Approval or Rejection.')
        }
    };

    const afterSubmit = (context) => {
        if (context.type !== context.UserEventType.EDIT) return;

        const rec = context.newRecord;
        const oldRec = context.oldRecord;

        const newStatus = rec.getValue('custrecord_wfs_status');
        const oldStatus = oldRec.getValue('custrecord_wfs_status');

        const name = rec.getValue('name');
        const emails = rec.getValue('custrecord_wfs_email');
        const phone = rec.getValue('custrecord_wfs_phone');
        const message = rec.getValue('custrecord_wfs_message');

        if (newStatus === '2' && oldStatus !== '2') {
            try {
                const customer = record.create({ type: record.Type.CUSTOMER, isDynamic: true });
                customer.setValue({ fieldId: 'companyname', value: name });
                customer.setValue({ fieldId: 'email', value: emails });
                customer.setValue({ fieldId: 'phone', value: phone }),
                customer.setValue({ fieldId: 'comments', value: message });
                customer.setValue({ fieldId: 'subsidiary', value: 1 });
                const customerId = customer.save();

                log.audit('Customer Created', `Customer ID" ${customerId}`);

                email.send({
                    author: runtime.getCurrentUser().id || -5,
                    recipients: emails,
                    subject: 'Your Submission Has Been Approved',
                    body: `Hello ${name},\n\nThank you for your submission. We've reviewed and approved it, and a customer record has been created for you in our system.`
                });

            } catch (e) {
                log.error('Error during approval process', e);
                throw e;
            }
        }

        if (newStatus === '3' && oldStatus !== '3') {
            try {
                email.send({
                    author: runtime.getCurrentUser().id || -5,
                    recipients: emails,
                    subject: 'Your Submission Was Rejected',
                    body: `Hello ${name},\n\nThank you for your submission. After reviewing your request, we regret to inform you that it has been rejected.\n\nIf you believe this was an error or want to appeal the decision, feel free to contact us.`
                });

                log.audit('Submission Rejected', `Notification sent to ${emails}`);
            } catch (e) {
                log.error('Error sending rejection email', e)
                throw e;
            }
        }
    };

    return { beforeSubmit, afterSubmit };
});