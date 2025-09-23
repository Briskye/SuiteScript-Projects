/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define([], () => {
    function pageInit (context) {
        // For deployment only
        
    }

    function saveRecord(context) {
        const field = document.getElementById('custpage_action');
        if (field) {
            field.value = 'update';
        }
        return true;
    }

    function setActionAndSubmit(action) {

        const actionField = document.getElementById('custpage_action');
        if (actionField) {
            actionField.value = action;
        }
        document.forms[0].submit();
    }

    return { 
        pageInit, 
        saveRecord,
        setActionAndSubmit 
    };
});