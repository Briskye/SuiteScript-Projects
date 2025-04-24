/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/record', 'N/url', 'N/redirect'], (ui, record, url, redirect) => {

    function onRequest(context) {
        const request = context.request;
        const response = context.response;

        const itemId = request.parameters.itemid;

        if(!itemId) {
            response.write('No item ID provided.');
            return;
        }

        const form = ui.createForm({
            title: 'Printable Item: ' + itemRecord.getValue({ fieldId: 'itemid' })
        });

        form.addField({
            id: 'custpage_item_name',
            label: 'Item Name',
            type: ui.FieldType.INLINEHTML
        }).defaultValue = '<h2>' + itemRecord.getValue({ fieldId: 'itemid' }) + '<h2>';

        form.addField({
            id: 'custpage_description',
            label: 'Description',
            type: ui.FieldType.INLINEHTML
        }).defaultValue = itemRecord.getValue({ fieldId: 'salesdescription'}) || 'No Description';

        form.addSubmitButton({
            label: 'Print'
        });

        response.writePage(form);
    }

    return {
        onRequest: onRequest
    };
});