/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/search', 'N/record', 'N/log'], (serverWidget, search, record, log) => {

    const onRequest = (context) => {
        const request = context.request;
        const response = context.response;

        const startDate = request.parameters.custpage_startdate || '';
        const endDate = request.parameters.custpage_enddate || '';
        const action = request.parameters.custpage_action || '';
        
        if (request.method === 'GET') {

            let form = buildForm(startDate, endDate);
            addInvoicesToSublist(form, startDate, endDate);
            response.writePage(form);

        } else if (request.method === 'POST') {
            if (action === 'update') {

                let updatedCount = processUpdates(request);

                let form = buildForm(startDate, endDate);

                addInvoicesToSublist(form, startDate, endDate);

                form.addField({
                    id: 'custpage_success',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: ' '
                }).defaultValue = `<p style="color: green; font-size: 16px;"> Successfully updated ${updatedCount} invoices to Approved. </p>`;

                response.writePage(form);
                
            } 

            if (action === 'search') {

                let form = buildForm(startDate, endDate)
                addInvoicesToSublist(form, startDate, endDate);
                response.writePage(form);
            } 
        }
    };

    function buildForm(startDate, endDate) {
        let form = serverWidget.createForm({ title: 'Bulk Invoice Update' });

        form.addField({
            id: 'custpage_startdate',
            type: serverWidget.FieldType.DATE,
            label: 'Start Date'
        }).defaultValue = formatDateForField(startDate);

        form.addField({
            id: 'custpage_enddate',
            type: serverWidget.FieldType.DATE,
            label: 'End Date'
        }).defaultValue = formatDateForField(endDate);

        form.addField({
            id: 'custpage_action',
            type: serverWidget.FieldType.TEXT,
            label: 'Action'
        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

        form.addButton({
            id: 'custpage_searchbtn',
            label: 'Search Invoices',
            functionName: "setActionAndSubmit('search')"
        });

        form.addSubmitButton({
            label: 'Update Selected Invoices'
        })

        form.clientScriptModulePath = 'SuiteScripts/John Files/cs_setAction.js';

        let sublist = form.addSublist({
            id: 'custpage_invoice_list',
            type: serverWidget.SublistType.LIST,
            label: 'Invoices'
        });

        sublist.addMarkAllButtons();

        sublist.addField({
            id: 'select',
            type: serverWidget.FieldType.CHECKBOX,
            label: 'Select'
        });

        sublist.addField({
            id: 'invoiceid',
            type: serverWidget.FieldType.TEXT,
            label: 'Invoice ID'
        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });

        sublist.addField({
            id: 'customer',
            type: serverWidget.FieldType.TEXT,
            label: 'Customer'
        });

        sublist.addField({
            id: 'amount',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Amount'
        });

        sublist.addField({
            id: 'status',
            type: serverWidget.FieldType.TEXT,
            label: 'Current Status'
        });

        return form;
    }

    function addInvoicesToSublist(form, startDate, endDate) {
        let filters = [
            ['mainline', 'is', 'T'],
            'AND', ['approvalstatus', 'anyof', '1']
        ];
        if (startDate) { 
            filters.push('AND');
            filters.push(['trandate', 'onorafter', startDate]);
        }
        if (endDate) {
            filters.push('AND');
            filters.push(['trandate', 'onorbefore', endDate]);
        }

        let invoiceSearch = search.create({
            type: search.Type.INVOICE,
            filters: filters,
            columns: [
                'internalid',
                'entity',
                'amount',
                'status'
            ]
        });

        let sublist = form.getSublist({ id: 'custpage_invoice_list' });
        let i = 0;
        invoiceSearch.run().each(result => {
            sublist.setSublistValue({
                id: 'invoiceid',
                line: i,
                value: result.getValue('internalid')
            });

            sublist.setSublistValue({
                id: 'customer',
                line: i,
                value: result.getText('entity') || 'N/A'
            });

            sublist.setSublistValue({
                id: 'amount',
                line: i,
                value: result.getValue('amount').toString()
            });

            sublist.setSublistValue({
                id: 'status',
                line: i,
                value: result.getText('status') || 'Unknown'
            });

            i++;
            return true;
        });
    }

    function processUpdates(request) {
        let lineCount = request.getLineCount({ group: 'custpage_invoice_list' }) || 0;
        log.debug('Line Count', lineCount);

        let updatedCount = 0;

        for (let i = 0; i < lineCount; i++) {
            let selected = request.getSublistValue({
                group: 'custpage_invoice_list',
                name: 'select',
                line: i
            });
            let invoiceId = request.getSublistValue({
                group: 'custpage_invoice_list',
                name: 'invoiceid',
                line: i
            });

            log.debug(`Row ${i}`, { invoiceId, selected });
        
            if (selected === 'T' && invoiceId) {
                record.submitFields({
                    type: record.Type.INVOICE,
                    id: invoiceId,
                    values: { approvalstatus: 2 } //Approved
                });
                updatedCount++
            }
        }

        return updatedCount;
    }

    function formatDateForField(dateStr) {
        if (!dateStr) return '';

        if (dateStr.includes('/') && dateStr.split('/').length === 3) {
            return dateStr;
        }

        if (dateStr.includes('-')) {
            let parts = dateStr.split('-');
            return parts[1] + '/' + parts[2] + '/' + parts[0];
        }

        return dateStr;
    }
        
    return { onRequest };
});