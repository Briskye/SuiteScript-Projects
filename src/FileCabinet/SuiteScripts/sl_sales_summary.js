/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/search'], (serverWidget, search) => {

    const onRequest = (context) => {

        const request = context.request;
        const response = context.response;

        if (request.parameters.action === 'export') {
            return exportCSV(request, response);
        }

        const form = serverWidget.createForm({ title: 'Sales Summary Report' });

        // Filter Fields
        const startField = form.addField({
            id: 'custpage_start',
            type: serverWidget.FieldType.DATE,
            label: 'Start Date'
        });

        const endField = form.addField({
            id: 'custpage_end',
            type: serverWidget.FieldType.DATE,
            label: 'End Date'
        });

        if (request.parameters.custpage_start) {
            startField.defaultValue = request.parameters.custpage_start;
        }
        if (request.parameters.custpage_end) {
            endField.defaultValue = request.parameters.custpage_end;
        }

        form.addSubmitButton('Run Report');
        form.addButton({
            id: 'custpage_export',
            label: 'Export CSV',
            functionName: "exportCSV"
        });

        form.clientScriptModulePath = 'SuiteScripts/John Files/cs_export_helper.js';

        if (request.method === 'POST') {
            const start = request.parameters.custpage_start;
            const end = request.parameters.custpage_end;

            let filters = [];
            if (start && end) {
                filters.push(['trandate', 'within', start, end]);
            }

            const salesSearch = search.create({
                type: search.Type.SALES_ORDER,
                filters: filters,
                columns: [
                    search.createColumn({ name: 'entity', summary: search.Summary.GROUP }),
                    search.createColumn({ name: 'amount', summary: search.Summary.SUM })
                ]
            });

            // Results Sublist
            const sublist = form.addSublist({
                id: 'custpage_results',
                type: serverWidget.SublistType.LIST,
                label: 'Sales by Customer'
            });

            sublist.addField({
                id: 'customer',
                type: serverWidget.FieldType.TEXT,
                label: 'Customer'
            });

            sublist.addField({
                id: 'total',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Total Sales'
            });

            // Run search and populate sublist
            let i = 0;
            salesSearch.run().each(result => {
                const customer = result.getText({
                    name: 'entity',
                    summary: search.Summary.GROUP
                }) || 'Unknown';

                const total = result.getValue({
                    name: 'amount',
                    summary: search.Summary.SUM
                }) || 0;

                sublist.setSublistValue({
                    id: 'customer',
                    line: i,
                    value: customer
                });

                sublist.setSublistValue({
                    id: 'total',
                    line: i,
                    value: total.toString()
                });

                i++;
                return true;
            });
        }

        context.response.writePage(form);
    };

    function exportCSV(request, response) {

        let start = request.parameters.custpage_start;
        let end = request.parameters.custpage_end;

        let filters = [];
        if (start && end) {
                filters.push(['trandate', 'within', start, end]);
            }

        let csvContent = "Customer,Total Sales\n";

        const salesSearch = search.create({
            type: search.Type.SALES_ORDER,
            filters: filters,
            columns: [
                search.createColumn({ name: 'entity', summary: search.Summary.GROUP }),
                search.createColumn({ name: 'amount', summary: search.Summary.SUM })
            ]
        });

        salesSearch.run().each(result => {
            const customer = result.getText({ name: 'entity', summary: search.Summary.GROUP }) || 'unknown';
            const total = result.getValue({ name: 'amount', summary: search.Summary.SUM }) || 0;
            csvContent += `"${customer}",${total}\n`;
            return true;
        });

        response.setHeader({
            name: 'Content-Type',
            value: 'text/csv'
        });
        response.setHeader({
            name: 'Content-Disposition',
            value: 'attachment; filename="sales_summary.csv"'
        });
        response.write(csvContent);
    }

    return { onRequest };
});