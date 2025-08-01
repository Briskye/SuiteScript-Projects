/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/ui/serverWidget', 'N/url', 'N/runtime'], (serverWidget, url, runtime) => {

    function beforeLoad(context) {
        if (context.type !== context.UserEventType.VIEW) return;

        const form = context.form;
        const invoiceId = context.newRecord.id;

        const suiteletUrl = url.resolveScript({
            scriptId: 'customscript_sl_invoice_status_changer',
            deploymentId: 'customdeploy_sl_invoice_status_changer',
            params: {
                invoiceId: invoiceId
            }
        });

        form.addButton({
            id: 'custpage_invoice_approval_btn',
            label: 'Approve/Reject Invoice',
            functionName: `window.open('${suiteletUrl}', '_blank')`
        });
    }
    return { beforeLoad };
});