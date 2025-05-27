/**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 */

define(['N/record'], (record) => {

    function each(params) {
        let recStockDescription = record.load({
            type: params.type,
            id: params.id
        });

        const updateStockDescription = recStockDescription.getValue({
            fieldId: 'stockdescription'
        });
        
        recStockDescription.setValue({
            fieldId: 'stockdescription',
            value: 'New Item'
        });
        log.debug(`Stock Description Has Been Set to: ${updateStockDescription}`);

        try{
            recStockDescription.save();
            log.debug('Stock Description is Updated');
        } catch (e) {
            log.error('Failed to update');
        }
    }

    return {
        each: each
    }
})