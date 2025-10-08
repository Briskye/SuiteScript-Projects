/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/render', 'N/record', 'N/file', 'N/log'], (render, record, file, log) => {

    function onRequest(context) {
        try {
            const request = context.request;
            const response = context.response;

            const recordId = request.parameters.recordId;
            if (!recordId) {
                response.write('Missing recordId parameter.');
                return;
            }

            const custPayment = record.load({
                type: record.Type.CUSTOMER_PAYMENT,
                id: recordId
            });

            const renderer = render.create();
            renderer.setTemplateByScriptId('CUSTTMPL_MINIMAL_RECEIPT_TEMPLATE');
            renderer.addRecord('record', custPayment);

            const pdfFile = renderer.renderAsPdf();

            response.writeFile({
                file: pdfFile,
                isInline: true
            });
        } catch (e) {
            log.error('Error generating custom PDF', e);
            context.response.write(`Error: ${e.message}`);
        }
    }

    return { onRequest };
});