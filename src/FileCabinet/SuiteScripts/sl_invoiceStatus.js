/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/record', 'N/redirect', 'N/search'], (serverWidget, record, redirect, search) => {

    function onRequest(context) {
        const request = context.request;
        const response = context.response;

        const invoiceId = request.parameters.invoiceId;

        if (request.method === 'GET') {
            if (!invoiceId) {
                response.write('Missing invoiceId parameter in URL.');
                return;
            }

            // load invoice record
            let invoiceRecord = record.load({
                type: record.Type.INVOICE,
                id: invoiceId,
                isDynamic: true
            });

            const form = serverWidget.createForm({
                title: `Invoice Approval - ID: ${invoiceId}`
            });

            // Display invoice fields
            form.addField({
                id: 'custpage_customer',
                type: serverWidget.FieldType.TEXT,
                label: 'Customer'
            }).defaultValue = invoiceRecord.getText({ fieldId: 'entity' });

            form.addField({
                id: 'custpage_total',
                type: serverWidget.FieldType.CURRENCY,
                label: 'total'
            }).defaultValue = invoiceRecord.getValue({ fieldId: 'total' });

            form.addField({
                id: 'custpage_status',
                type: serverWidget.FieldType.SELECT,
                label: 'Approval Status',
                source: 'customlist_invoice_approval'
            }).defaultValue = invoiceRecord.getText({ fieldId: 'custbody_invoice_status'}) || 'Pending';

            // Add Approve and Reject buttons
            form.addSubmitButton({
                label: 'Approve'
            });

            form.addButton({
                id: 'reject',
                label: 'Reject',
                functionName: 'rejectInvoice'
            });

            // Inject client script
            form.clientScriptModulePath = 'SuiteScripts/John Files/cs_invoice_approval.js';

            form.addField({
                id: 'custpage_invoice_id',
                type: serverWidget.FieldType.TEXT,
                label: 'Invoice ID'
            }).defaultValue = invoiceId;

            response.writePage(form);

        } else if (request.method === 'POST') {
            const invoiceId = request.parameters.custpage_invoice_id;
            const isRejected = request.parameters.rejectinvoice === 'T';

            const APPROVED_ID = 2;
            const REJECTED_ID = 3;

            try {
                log.debug('Updating invoice', { invoiceId, isRejected });

                let invoiceRecord = record.load({
                    type: record.Type.INVOICE,
                    id: invoiceId,
                    isDynamic: true
                });

                invoiceRecord.setValue({
                    fieldId: 'custbody_invoice_status',
                    value: isRejected ? REJECTED_ID : APPROVED_ID
                });

                invoiceRecord.save();

                redirect.toRecord({
                    type: record.Type.INVOICE,
                    id: invoiceId
                });
            } catch (e) {
                log.error('Error Updating Invoice', e);
                response.write('Failed to update invoice approval status.');
            }
        }
    }

    return { onRequest };
});