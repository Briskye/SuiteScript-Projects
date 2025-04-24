/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/url', 'N/record'], (url, record) => {

    function beforeLoad(context) {
        if(context.type !== context.UserEventType.VIEW) return;

        const form = context.form;
        const itemId = context.newRecord.id;

        const suiteletURL = url.resolveScript({
            scriptId: 'customscript_print_item_suitelet',
            deploymentId: 'customdeploy_print_item_suitelet',
            params: {
                itemId: itemId
            }
        });

        form.addButton({
            id: 'custpage_print_item_btn',
            label: 'Print Item',
            functionName: `function() { window.open('$suiteletURL}', '_blank'); }`
        });
    }
    
    return {
        beforeLoad: beforeLoad
    }
});