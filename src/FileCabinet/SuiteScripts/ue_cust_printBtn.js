/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/ui/serverWidget', 'N/url', 'N/runtime'], (ui, url, runtime) => {

    function beforeLoad(context) {
        if (context.type === context.UserEventType.VIEW) {
            const form = context.form;
            const recId = context.newRecord.id;
            
            const suiteletUrl = url.resolveScript({
                scriptId: 'customscript_sl_custom_print_tmplt',
                deploymentId: 'customdeploy_sl_custom_print_tmplt',
                params: { recordId: recId }
            });

            form.addButton({
                id: 'custpage_print_custom_receipt',
                label: 'Print Custom Receipt',
                functionName: `window.open('${suiteletUrl}', '_blank')`
            });
        }
    }

    return { beforeLoad };
});