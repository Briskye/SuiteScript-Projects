/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/email', 'N/runtime'], (serverWidget, email, runtime) => {
    
    const onRequest = (context) => {
        if (context.request.method === 'GET') {
            let form = serverWidget.createForm({ title: 'Send Reminder' });

            form.addField({
                id: 'custpage_recipient',
                type: serverWidget.FieldType.EMAIL,
                label: 'Recipient Email'
            }).isMandatory = true;

            form.addField({
                id: 'custpage_message',
                type: serverWidget.FieldType.TEXTAREA,
                label: 'Reminder Message'
            }).defaultValue = 'This is a reminder email sent from a Suitelet.';

            form.addSubmitButton({ label: 'Send Reminder Email' });

            context.response.writePage(form);

        } else {
            
            let recipient = context.request.parameters.custpage_recipient;
            let message = context.request.parameters.custpage_message || 'This is a reminder email sent from a Suitelet.';
            let userId = runtime.getCurrentUser().id;

            email.send({
                author: userId,
                recipients: recipient,
                subject: 'Suitelet Reminder',
                body: message
            });

            let form = serverWidget.createForm({ title: 'Reminder Sent' });
            form.addField({
                id: 'custpage_confirmation',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Confirmation'
            }).defaultValue = `<p style="color: green; font-weight: bold;">Reminder email sent successfully to ${recipient}</p>`;

            context.response.writePage(form);
        }
    };

    return { onRequest }; 
});