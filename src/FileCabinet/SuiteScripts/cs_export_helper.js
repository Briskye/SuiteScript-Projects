/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define([], () => {

    function pageInit (context) {
        // For deployment only
    }

    function exportCSV() {
        try {
            let startDate = document.forms[0]['custpage_start'].value || '';
            let endDate = document.forms[0]['custpage_end'].value || '';

            let scriptId = '679';
            let deployId = '1';

            let url = `/app/site/hosting/scriptlet.nl?script=${scriptId}&deploy=${deployId}&action=export`;

            if (startDate) url += `&custpage_start=${encodeURIComponent(startDate)}`;
            if (endDate) url += `&custpage_end=${encodeURIComponent(endDate)}`;

            window.location.href = url;

        } catch (e) {
            alert('Error exporting CSV: ' + e.message);
        }
    }

    return {
        pageInit,
        exportCSV
    };
});