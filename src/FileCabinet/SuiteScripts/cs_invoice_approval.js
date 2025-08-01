/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define ([], () => {

    function pageInit() {
        // to make the file uploadable in File Cabinet
    }

    function rejectInvoice() {
        const form = document.forms[0];
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'rejectinvoice';
        input.value = 'T';
        form.appendChild(input);
        form.submit();
    }

    return {
       pageInit, rejectInvoice
    };
});