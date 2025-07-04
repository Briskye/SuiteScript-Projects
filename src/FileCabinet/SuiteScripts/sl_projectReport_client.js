/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(() => {

    function onExportCSV() {
        window.location.href += '&export=csv';
    }

    function pageInit () {
        console.log('Export page loaded');
    }

    return { onExportCSV, pageInit };
})