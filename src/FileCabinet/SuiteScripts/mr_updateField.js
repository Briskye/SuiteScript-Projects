/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/record', 'N/search'], (record, search) => {

    const DEPARTMENT_ID = '2'; // Department Internal ID 

    function getInputData() {
        return search.load({
            id: 'customsearch_inventory_item' // Existing Saved Search... Can also create a new saved search.
        });
    }

    function map(context) {
        try {
            const result = JSON.parse(context.value);
            const itemId = result.id;

            const itemRecord = record.load({
                type: record.Type.INVENTORY_ITEM,
                id: itemId,
                isDynamic: false
            });

            itemRecord.setValue({
                fieldId: 'department',
                value: DEPARTMENT_ID
            })

            itemRecord.save();
            log.audit('Item Updated', `Item ID ${itemId} updated with department ${DEPARTMENT_ID}`)
        } catch (e) {
            log.error('Error Updating Item', e.toString())
        }
    }

    return {
        getInputData,
        map
    }
});