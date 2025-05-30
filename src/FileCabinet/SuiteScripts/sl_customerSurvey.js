/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/record'], (serverWidget, record) => {

    const onRequest = (context) => {
        if(context.request.method === 'GET') {
            // Create the form
            const form = serverWidget.createForm({
                title: 'Customer Satisfaction Survey'
            });

            // Add fields
            form.addField({
                id: 'custpage_name',
                type: serverWidget.FieldType.TEXT,
                label: 'Your Name'
            });

            form.addField({
                id: 'custpage_email',
                type: serverWidget.FieldType.EMAIL,
                label: 'Email Address'
            });

            const ratingField = form.addField({
                id: 'custpage_rating',
                type: serverWidget.FieldType.SELECT,
                label: 'Rate Our Service',
                source: ''
            });
            ratingField.addSelectOption({ value: '', text: '-- Select --'});
            ratingField.addSelectOption({ value: '1', text: '1 - Poor' });
            ratingField.addSelectOption({ value: '2', text: '2 - Fair' });
            ratingField.addSelectOption({ value: '3', text: '3 - Good' });
            ratingField.addSelectOption({ value: '4', text: '4 - Very Good' });
            ratingField.addSelectOption({ value: '5', text: '5 - Excellent' });

            form.addField({
                id: 'custpage_comments',
                type: serverWidget.FieldType.TEXTAREA,
                label: 'Additional Comments'
            });
            
            // Add Submit Button
            form.addSubmitButton({ label: 'Submit Survey' });

            context.response.writePage(form);
            
        } else if (context.request.method === 'POST') {
            // Handle form submission
            const name = context.request.parameters.custpage_name;
            const email = context.request.parameters.custpage_email;
            const rating = context.request.parameters.custpage_rating;
            const comments = context.request.parameters.custpage_comments;

            try {
                // Create a 
                const rec = record.create({
                    type: 'customrecord_survey_response',
                    isDynamic: true
                });

                rec.setValue({ fieldId: 'name', value: name });
                rec.setValue({ fieldId: 'custrecord_survey_email', value: email});
                rec.setValue({ fieldId: 'custrecord_survey_rating', value: rating});
                rec.setValue({ fieldId: 'custrecord_survey_comments', value: comments});

                const recId = rec.save();

                log.debug('Survey Saved', `Record ID: ${recId}`);
            

            // Show a Thank you message
            const form = serverWidget.createForm({ title: 'Thank You!' });
            form.addField({
                id: 'custpage_thankyou',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Thank You Message'
            }).defaultValue = `<div style="font-size: 14px;">
                <p>Thanks <b>${name || 'Guest'}</b> for completing the survey!</p>
                <p><b><i>Your Response has been Recorded.<i></b></p>
            </div>`;

            context.response.writePage(form);

            } catch (e) {
                log.error('Error Saving Survey Response', e.message);
                throw e;
            }
        }
    };

    return {
        onRequest
    };
});