/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/log', 'N/record'], (search, log, record) => {
  
  const afterSubmit = (context) => {
    try {
      if (context.type === context.UserEventType.CREATE || context.type === context.UserEventType.EDIT) {
        const salesOrder = context.newRecord;
        const soId = salesOrder.id;

        const savedSearchId = 'customsearch_transaction_test'; 

        // Load the Saved Search 
        const savedSearch = search.load({ id: savedSearchId });

        // Run the Saved Search and iterate through each result
        let resultCount = 0;
        savedSearch.run().each(result => {
          resultCount++;  // Increment result counter

          const entity = result.getText({ name: 'entity' });
          const tranDate = result.getValue({ name: 'trandate' });
          const amount = result.getValue({ name: 'amount' });
          
          // Log the result in the execution log
          log.debug(`Search Result #${resultCount}`, `Name: ${entity} - Date: ${tranDate} - Amount: ${amount} `);

          return true; // continue to next result
        });

        // Showing how many results were processed
        log.audit('Saved Search Completed', `Total results: ${resultCount}`);
      }
    } catch (error) {
      log.error('Error in afterSubmit', error);
    }
  };

  return { afterSubmit };
});
