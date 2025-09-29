/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/currentRecord'], (currentRecord) => {
    function pageInit (context) {
        // For Deployment
    }

    function saveRecord(context) {
        const rec = context.currentRecord;
        const lineCount = rec.getLineCount({ sublistId: 'custpage_transactions' });

        let selected = [];
        for (let i = 0; i < lineCount; i++) {
            const checked = rec.getSublistValue({
                sublistId: 'custpage_transactions',
                fieldId: 'custpage_transactions_select',
                line: i
            });
            if (checked === true || checked === 'T') {
                selected.push({
                    tranid: rec.getSublistValue({
                        sublistId: 'custpage_transactions',
                        fieldId: 'custpage_transactions_tranid',
                        line: i
                    }),
                    date: rec.getSublistValue({
                        sublistId: 'custpage_transactions',
                        fieldId: 'custpage_transactions_date',
                        line: i
                    }),
                    amount: rec.getSublistValue({
                        sublistId: 'custpage_transactions',
                        fieldId: 'custpage_transactions_amount',
                        line: i
                    })
                });
            }
        }

        console.log('Selected JSON', JSON.stringify(selected));

        rec.setValue({
            fieldId: 'custpage_selected_txns',
            value: JSON.stringify(selected)
        });

        return true;
    }

    function exportSelected() {
        const rec = currentRecord.get();
        const customer = rec.getValue({ fieldId: 'custpage_customer' });
        const selected = rec.getValue({ fieldId: 'custpage_selected_txns' });

        const data = JSON.parse(selected);
        let csv = 'Transaction #,Amount\n';
        data.forEach(t => {
            csv += `${t.tranid},${t.amount}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Customer_${customer}_Transactions.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    return {
        pageInit,
        saveRecord,
        exportSelected
    };
});
