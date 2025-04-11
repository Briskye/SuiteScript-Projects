/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/ui/dialog'], (dialog) => {
    
    function pageInit() {
        let myAlert = {
            title: 'Hi there!',
            message: 'Click Ok to continue.'
        };

        // to display alert dialog
        dialog.alert(myAlert).then(success).catch(fail);
        
    }
    
    return {
        pageInit: pageInit
    };
    
    function success(result) {
        console.log ('Success' + result);
    }
    function fail(reason) {
        console.log('Alert Failed' + reason)
    }
});

