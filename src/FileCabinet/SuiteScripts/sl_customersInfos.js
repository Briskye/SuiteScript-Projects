/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/record', 'N/email', 'N/runtime'], (ui, record, email, runtime) => {

    const onRequest = (context) => {
        if (context.request.method === 'GET') {
            const form = ui.createForm({ title: 'Customer Contact Form' });

            form.addField({
                id: 'custpage_name',
                type: ui.FieldType.TEXT,
                label: 'Company Name'
            }).isMandatory = true;

            form.addField({
                id: 'custpage_email',
                type: ui.FieldType.EMAIL,
                label: 'Email'
            }).isMandatory = true;

            form.addField({
                id: 'custpage_phone',
                type: ui.FieldType.PHONE,
                label: 'Phone'
            });

            form.addField({
                id: 'custpage_message',
                type: ui.FieldType.TEXTAREA,
                label: 'Message'
            });

            form.addSubmitButton({ label: 'Submit' });

            context.response.writePage(form);
        }

        else if (context.request.method === 'POST') {
            const name = context.request.parameters.custpage_name;
            const emails = context.request.parameters.custpage_email;
            const phone = context.request.parameters.custpage_phone;
            const message = context.request.parameters.custpage_message;

            try {
            const submission = record.create({ type: 'customrecord_web_form_submission' });

            const utc = new Date();
            const phTime = new Date(utc.getTime() + (8 * 60 * 60 * 1000)); // UTC+8 manually

            const year = phTime.getFullYear();
            const month = String(phTime.getMonth() + 1).padStart(2, '0');
            const day = String(phTime.getDate()).padStart(2, '0');
            let hours = phTime.getHours();
            const minutes = String(phTime.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12; // convert to 12-hour format

            const formattedTime = `${year}-${month}-${day} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
            const generatedName = `${name} - ${formattedTime}`;

            submission.setValue({ fieldId: 'name', value: generatedName});
            submission.setValue({ fieldId: 'custrecord_wfs_name', value: name });
            submission.setValue({ fieldId: 'custrecord_wfs_email', value: emails });
            submission.setValue({ fieldId: 'custrecord_wfs_phone', value: phone });
            submission.setValue({ fieldId: 'custrecord_wfs_message', value: message });

            submission.setValue({ fieldId: 'custrecord_wfs_status', value: '1' });

            submission.save();

            context.response.write('Thank you! Your submission has been received and is pending approval.');
            } catch (e) {
                log.error('Form Submission Error', e);
                context.response.write('Sorry, there was a problem submitting your form');
            }
        }
    };

    return { onRequest };
});