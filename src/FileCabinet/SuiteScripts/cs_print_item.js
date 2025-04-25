/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/currentRecord', 'N/url', 'N/log'], (currentRecord, url, log) => {

    function printItem() {
    try {
        var rec = currentRecord.get();
        var itemId = rec.id;

        if (!itemId) {
            const match = window.location.href.match(/id=(\d+)/i)
            if (match && match[1]) {
                itemId = match[1];
                alert('fetched from URL: ' + itemId);
            } else {
                alert('Cannot find item ID')
                return;
            }
        }
        
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_print_item_suitelet',
            deploymentId: 'customdeploy_print_item_suitelet',
            params: { itemid: itemId }
        });

        alert('Opening Suitlet with itemid= ' + itemId);
        window.open(suiteletUrl, '_blank');

        }

        catch (e) {
        alert('Error: ' + e.message);
        log.error('PrintItem()', e.toString());
        }

    }

    function pageInit () {
        console.log('Print page loaded');
    }

    return {
        printItem: printItem,
        pageInit: pageInit
    };
});