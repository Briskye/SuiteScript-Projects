/** 
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/record', 'N/search', 'N/log'], (record, search, log) => {

    function afterSubmit (context) {
        if (context.type !== context.UserEventType.EDIT && 
            context.type !== context.UserEventType.CREATE) {
             return;
        }

        try {
            const itemId = context.newRecord.id;

            const itemRecord = record.load({
                type: record.Type.INVENTORY_ITEM,
                id: itemId,
                isDynamic: false
            });

            const priceCount = itemRecord.getLineCount({ sublistId: 'price1' });
            log.debug('Total price levels:', priceCount);

            // Get the name of the price level for logging
            for (let i = 0; i < priceCount; i++) {
                const priceLevel = itemRecord.getSublistText({
                    sublistId: 'price1',
                    fieldId: 'pricelevel',
                    line: i
                });
                
                const priceValue = itemRecord.getSublistValue({
                    sublistId: 'price1',
                    fieldId: 'price_1_', // This is where NetSuite stores the actual price
                    line: i
                });

                log.debug(`Price Level: ${priceLevel}`, `Qty 0 Price: ${priceValue}`);

                // If a price is found, set it to custom field and save
                if (priceValue != null) {
                    itemRecord.setValue({
                        fieldId: 'custitem_lm_jpy_price',
                        value: priceValue
                    });

                    itemRecord.save({
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    });
                    
                    log.debug('Custom field updated with price:', priceValue);
                    break;
                }
            }
        

        const searchTitle = 'Inventory Items Custom Base Price';
        const searchId = 'customsearch_inventory_item';

        try {
            search.load({ id: searchId });
            log.debug('Search Exists, skipping creation.');
        } catch (e) {
            log.debug('Creating new saved search:', searchTitle);
            const newSearch = search.create({
                type: search.Type.INVENTORY_ITEM,
                title: searchTitle,
                id: searchId,
                filters: [
                    ['custitem_lm_jpy_price', 'isnotempty', '']
                ],
                columns: [
                    'itemid',
                    'custitem_lm_jpy_price'
                ]
            });

            newSearch.save();
            log.debug('Saved Search Created:', searchId);
        } 
        } catch (e) {
            log.error('Error in afterSubmit', e);
        }
    }

    return {
        afterSubmit: afterSubmit
    }
});

