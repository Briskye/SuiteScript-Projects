/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/currentRecord'], (currentRecord) => {

    function pageInit (context) {
        // To make the file uploadable in File Cabinet
    }

    function redirectToSurvey() {
        const rec = currentRecord.get();
       // const customerId = rec.id

        const url = `/app/site/hosting/scriptlet.nl?script=647&deploy=1`;
        window.open(url, '_blank');
    }

    return {
        pageInit,
        redirectToSurvey
    };
});