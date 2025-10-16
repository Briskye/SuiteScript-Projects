/**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 */

define(['N/record', 'N/runtime', 'N/log'], (record, runtime, log) => {

    function each(context) {
        const itemId = context.id;

        try {
            const itemRec = record.load({
                type: record.Type.INVENTORY_ITEM,
                id: itemId
            });

            const oldValue = itemRec.getValue('custitem_stockbuffer') || 0;
            const newValue = oldValue + 10;

            itemRec.setValue({
                fieldId: 'custitem_stockbuffer',
                value: newValue
            });

            itemRec.save();

            log.audit('Updated Stock Buffer', `Item ID ${itemId}: ${oldValue} - ${newValue}`);

        } catch (e) {
            log.error('Error updating item', `${itemId}: ${e.message}`);
        }
    }

    return { each };
});