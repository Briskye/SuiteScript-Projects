/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define([], () => {

    function beforeLoad(context) {
        if (context.type !== context.UserEventType.EDIT &&
            context.type !== context.UserEventType.CREATE) return;

            const form = context.form;

            form.clientScriptModulePath = 'SuiteScripts/John Files/cs_clearFields.js';

            form.addButton({
                id: 'custpage_clear_fields',
                label: 'Clear Fields',
                functionName: 'clearAllFields'
            });
    }

    return {
        beforeLoad: beforeLoad
    };
});