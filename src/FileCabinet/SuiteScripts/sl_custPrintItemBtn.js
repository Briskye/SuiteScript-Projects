/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/record', 'N/log'], (ui, record, log) => {

    function onRequest(context) {
        const request = context.request;
        const response = context.response;

        const itemId = request.parameters.itemid;
        log.debug('Suitelet triggered', 'Params: ' + JSON.stringify(request.parameters));

        if(!itemId) {
            log.error('Missing itemId', 'itemId is not passed in the request');
            response.write('No item ID provided.');
            return;
        }

        log.debug('Received itemId', itemId);

        const itemRecord = record.load({
            type: record.Type.INVENTORY_ITEM,
            id: itemId
        });

        const form = ui.createForm({
            title: 'Printable Item Details'
        });

        const fieldIds = itemRecord.getFields()

        let html = '<table border="1" style="width: 100%; border-collapse: collapse;">';
        html += '<tr><th style="text-align: left;">Field ID</th><th style="text-align: left;">Value</th></tr>';
        
        fieldIds.forEach(function(fieldId) {
            try {
                const value = itemRecord.getText({ fieldId }) || itemRecord.getValue({ fieldId });
                html += `<tr><td>${fieldId}</td><td>${value !== null ? value : ''}</td></tr>`;
            } 

            catch (e) {

            }
        });

        html += '</table>';

        form.addField({
            id: 'custpage_html_output',
            label: 'Print',
            type: ui.FieldType.INLINEHTML
        }).defaultValue = html;

        form.addSubmitButton({ label: 'Print (Use Ctrl+P)' });

        response.writePage(form);
    }

    return {
        onRequest: onRequest
    };
});