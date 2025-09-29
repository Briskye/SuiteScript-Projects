/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/search', 'N/record', 'N/redirect', 'N/log', 'N/runtime'], (serverWidget, search, record, redirect, log, runtime) => {

    function onRequest(context) {
        const req = context.request;
        const res = context.response;

        if (req.parameters.action === 'export') {
            try {
                const transactions = JSON.parse(req.parameters.custpage_selected_txns || '[]');

                res.setHeader({
                    name: 'Content-Type',
                    value: 'text/csv;charset=utf-8'
                });
                res.setHeader({
                    name: 'Content-Disposition',
                    value: 'attachment; filename="selected_invoices.csv"'
                });

                let csv = 'Transaction ID,Date,Amount\n';
                transactions.forEach(t => {
                    csv += `${t.tranid},${t.date},${t.amount}\n`;
                });

                res.write(csv);
                return;
            } catch (e) {
                log.error('Export Error', e);
                res.write('Error while exporting CSV.');
                return;
            }
        }

        const step = req.parameters.step || '1';

        if (req.method === 'GET') {
            if (step === '1') {
                renderStep1(res);
            } else if (step === '2') {
                renderStep2(res, req.parameters.custpage_customer);
            } else if (step === '3') {
                renderStep3(res, req.parameters.custpage_customer, req.parameters.selected_transactions);
            }
        } else if (req.method === 'POST') {
            if (step === '1') {
                const customerId = req.parameters.custpage_customer;
                redirect.toSuitelet({
                    scriptId: runtime.getCurrentScript().id,
                    deploymentId: runtime.getCurrentScript().deploymentId,
                    parameters: { step: '2', custpage_customer: customerId }
                });
            } else if (step === '2') {
                const customerId = req.parameters.custpage_customer;
                const selectedTransactions = req.parameters.custpage_selected_txns || '[]';
                log.debug('Step 2 POST Raw', {
                    customerId: customerId,
                    selected_txns: selectedTransactions
                });

                renderStep3(res, customerId, selectedTransactions);
            } else if (step === '3') {
                const customerId = req.parameters.custpage_customer;
                const transactions = JSON.parse(decodeURIComponent(req.parameters.selected_transactions || '[]'));

                log.audit('Wizard Complete', `Customer ${customerId} selected Transactions: ${transactions.map(t => t.tranid).join(', ')}`);

                const form = serverWidget.createForm({ title: 'Wizard Complete' });
                form.addField({
                    id: 'custpage_message',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: ' '
                }).defaultValue = `<div style="color: green"><b>Success!</b> You selected customer ${customerId} and transactions: ${transactions.join(', ')}</div>`;
                res.writePage(form);
            }
        }
    }

    function renderStep1(res) {
        const form = serverWidget.createForm({ title: 'Step 1: Choose Customer' });

        form.addField({
            id: 'custpage_customer',
            type: serverWidget.FieldType.SELECT,
            label: 'Customer',
            source: 'customer'
        });

        form.addField({
            id: 'step',
            type: serverWidget.FieldType.TEXT,
            label: 'Step'
        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN }).defaultValue = '1';

        form.addSubmitButton('Next');
        res.writePage(form);
    }

    function renderStep2(res, customerId) {
        const form = serverWidget.createForm({ title: 'Step 2: Choose Transactions' });

        const custLookup = search.lookupFields({
            type: search.Type.CUSTOMER,
            id: customerId,
            columns: ['altname']
        });

        const custName = custLookup.altname || '';

        form.addField({
            id: 'custpage_customer_display',
            type: serverWidget.FieldType.TEXT,
            label: 'Customer'
        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE }).defaultValue = custName;

        form.addField({
            id: 'custpage_customer',
            type: serverWidget.FieldType.TEXT,
            label: 'Customer ID'
        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN }).defaultValue = customerId;

        form.addField({
            id: 'step',
            type: serverWidget.FieldType.TEXT,
            label: 'Step'
        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN }).defaultValue = '2';

        const sublist = form.addSublist({
            id: 'custpage_transactions',
            type: serverWidget.SublistType.LIST,
            label: 'Transactions'
        });

        sublist.addMarkAllButtons();

        sublist.addField({
            id: 'custpage_transactions_select',
            type: serverWidget.FieldType.CHECKBOX,
            label: 'Select'
        });
        sublist.addField({
            id: 'custpage_transactions_tranid',
            type: serverWidget.FieldType.TEXT,
            label: 'Transaction #'
        });
        sublist.addField({
            id: 'custpage_transactions_date',
            type: serverWidget.FieldType.TEXT,
            label: 'Date'
        });
        sublist.addField({
            id: 'custpage_transactions_amount',
            type: serverWidget.FieldType.TEXT,
            label: 'Amount'
        });

        const txnSearch = search.create({
            type: search.Type.INVOICE,
            filters: [
                ['entity', 'anyof', customerId],
                'AND',
                ['mainline', 'is', 'T']
            ],
            columns: ['tranid', 'trandate', 'amount']
        });

        let line = 0;
        txnSearch.run().each(r => {
            sublist.setSublistValue({
                id: 'custpage_transactions_tranid',
                line,
                value: r.getValue('tranid')
            });
            sublist.setSublistValue({
                id: 'custpage_transactions_date',
                line,
                value: r.getValue('trandate')
            });
            sublist.setSublistValue({
                id: 'custpage_transactions_amount',
                line,
                value: r.getValue('amount').toString()
            });
            line++;
            return true;
        });

        form.addField({
            id: 'custpage_selected_txns',
            type: serverWidget.FieldType.LONGTEXT,
            label: 'Selected Txns'
        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

        form.clientScriptModulePath = 'SuiteScripts/John Files/cs_selected_txns.js';

        form.addSubmitButton('Next');
        res.writePage(form);
    }

    function renderStep3(res, customerId, selectedTransactions) {
        const form = serverWidget.createForm({ title: 'Step 3: Confirm Selection' });

        let selected = [];
        try {
            selected = JSON.parse(selectedTransactions || '[]');
        } catch (e) {
            log.error('JSON Parse Error', e);
        }

        form.addField({
            id: 'custpage_customer',
            type: serverWidget.FieldType.TEXT,
            label: 'Customer'
        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE }).defaultValue = customerId;

        form.addField({
            id: 'step',
            type: serverWidget.FieldType.TEXT,
            label: 'Step'
        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN }).defaultValue = '3';

        form.addField({
            id: 'selected_transactions',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Selected Transactions'
        }).defaultValue = `<ul>${selected.map(t => ` <li>${t.tranid} (${t.amount})</li>`).join('')}</ul>`;

        form.addField({
            id: 'custpage_selected_txns',
            type: serverWidget.FieldType.LONGTEXT,
            label: 'Selected Txns'
        }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN }).defaultValue = JSON.stringify(selected);

        form.addButton({
            id: 'custpage_export_btn',
            label: 'Export Selected',
            functionName: 'exportSelected'
        });

        form.clientScriptModulePath = 'SuiteScripts/John Files/cs_selected_txns.js';

        form.addSubmitButton('Finish');
        res.writePage(form);
    }

    return {
        onRequest
    };
});