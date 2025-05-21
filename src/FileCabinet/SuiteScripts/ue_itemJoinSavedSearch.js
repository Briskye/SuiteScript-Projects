/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/search', 'N/log'], (search, log) => {
  
  const beforeLoad = (context) => {
    try {

        const savedSearchId = 'customsearch_item_base_price_002';
        const searchTitle = 'Join Saved Search Inventory Item';
        try {
            search.load({ id: savedSearchId });
            log.debug('Search already exists');
            return;
        } catch (e) {
            log.debug('Search does not exist yet, creating', searchTitle);
        }
      // Create the item search with join to pricing sublist
        const itemSearch = search.create({
            type: search.Type.INVENTORY_ITEM,
            title: searchTitle,
            id: savedSearchId,
            filters: [
            ['custitem_lm_jpy_price', 'isnotempty', ''] 
            ],
            columns: [
            'itemid',
            'type',
            'pricing.unitprice',
            'pricing.currency',
            'pricing.pricelevel'
            ]
        });

        // Run the search and log results
        itemSearch.run().each(result => {
            const itemId = result.getValue({ name: 'itemid' });
            const unitPrice = result.getValue({ name: 'unitprice', join: 'pricing' });
            const currency = result.getText({ name: 'currency', join: 'pricing' });

            log.debug(`Item: ${itemId}`, `Base Price: ${unitPrice} ${currency}`);

            itemSearch.save();
            log.debug('Saved Search Created', savedSearchId);
            return true; // continue to next result
        
        });
        
        } catch (e) {
        log.error('Error in beforeLoad', e.toString());
        }
  };

    return { 
        beforeLoad: beforeLoad
    };
});
