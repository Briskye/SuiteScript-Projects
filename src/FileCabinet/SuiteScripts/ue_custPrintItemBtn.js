/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/url', 'N/record'], (url, record) => {

    function beforeLoad(context) {
        if(context.type !== context.UserEventType.VIEW) return;

        const form = context.form;

        form.clientScriptModulePath = 'SuiteScripts/John Files/cs_print_item.js';

        form.addButton({
            id: 'custpage_print_item_btn',
            label: 'Print Item',
            functionName: 'printItem'
        });
    }
    
    return {
        beforeLoad: beforeLoad
    }
});