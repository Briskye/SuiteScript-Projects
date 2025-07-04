/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/search', 'N/file'], (ui, search, file) => {

    const onRequest = (context) => {
         const request = context.request;

         const exportCSV = request.parameters.export === 'csv';

         const projectSearch = search.create({
            type: search.Type.JOB,
            columns: ['entityid', 'customer', 'startdate', 'enddate', 'status'],
            filters: []
        });

        if (exportCSV) {
            let csv = 'Project Name,Customer,Start Date,End Date,Status\n';

            projectSearch.run().each(result => {
                const name = escapeCSV(result.getValue('entityid') || '');
                const customer = escapeCSV(result.getText('customer') || '');
                const startDate = escapeCSV(result.getValue('startdate') || '');
                const endDate = escapeCSV(result.getValue('enddate') || '');
                const status = escapeCSV(result.getText('status') || '');

                csv += `${name},${customer},${startDate},${endDate},${status}\n`
                return true;
            });

            const csvFile = file.create({
                name: 'project_report.csv',
                fileType: file.Type.CSV,
                contents: csv
            });

            context.response.writeFile({
                file: csvFile,
                isInline: false
            });
        } else {

            const form = ui.createForm({ title: 'Project Report' });

            form.addButton({
                id: 'custpage_export_csv',
                label: 'Export as CSV',
                functionName: "onExportCSV"
            });

            form.clientScriptModulePath = 'SuiteScripts/John Files/sl_projectReport_client.js';


            const sublist = form.addSublist({
                id: 'project_list',
                label: 'Project Report',
                type: ui.SublistType.LIST
            });

            sublist.addField({ id: 'name', label: 'Project Name', type: ui.FieldType.TEXT });
            sublist.addField({ id: 'customer', label: 'Customer', type: ui.FieldType.TEXT });
            sublist.addField({ id: 'start_date', label: 'Start Date', type: ui.FieldType.DATE });
            sublist.addField({ id: 'end_date', label: 'End Date', type: ui.FieldType.DATE });
            sublist.addField({ id: 'status', label: 'Status', type: ui.FieldType.TEXT });

            
            let i = 0;
            projectSearch.run().each(result => {

                const name = result.getValue('entityid') || '';
                const customer = result.getText('customer') || '';
                const startDate = result.getValue('startdate') || '';
                const endDate = result.getValue('enddate') || '';
                const status = result.getText('status') || '';

                if (name) sublist.setSublistValue({ id: 'name', line: i, value: name });
                if (customer) sublist.setSublistValue({ id: 'customer', line: i, value: customer });
                if (startDate) sublist.setSublistValue({ id: 'start_date', line: i, value: startDate });
                if (endDate) sublist.setSublistValue({ id: 'end_date', line: i, value: endDate });
                if (status) sublist.setSublistValue({ id: 'status', line: i, value: status });

                i++;
                return true;
            });

            context.response.writePage(form);
        }

    };

    function escapeCSV(value) {
        if (value.includes(',') || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    return { onRequest };
});