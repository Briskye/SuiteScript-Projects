/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/search','N/log'], (search, log) => {

    function afterSubmit (context) {
        try {
            const savedSearchId = 'customsearch_transaction_test';
            const transactionSearch = search.load({
                id: savedSearchId
            });

            const searchResults = transactionSearch.run().getRange({
                start: 0,
                end: 10
            });

            searchResults.forEach(function(result){
                const tranDate = result.getValue({ name: 'trandate'});
                const entity = result.getValue({ name: 'entity'});
                const type = result.getValue({ name: 'type' });
                const amount = result.getValue({ name: 'amount'});
                

                log.debug('Transaction Result', `Tran ID: ${tranDate}, Entity: ${entity}, Type: ${type}, Amount: ${amount}`);
            });
        } catch (e)  {
            log.error({
                title: 'Error executing Saved Search',
                details: e.message
            });
        }
    }

    return { afterSubmit };
});