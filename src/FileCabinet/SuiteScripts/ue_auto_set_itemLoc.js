/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/record'], (record) => {

    function afterSubmit(context) {
        try{
            if (context.type !== context.UserEventType.CREATE &&
                context.type !== context.UserEventType.EDIT) {
                return;
            }

            const recId = context.newRecord.id;
            const recType = context.newRecord.type;

            const rec = record.load({
                type: recType,
                id: recId,
                isDynamic: false
            });

            const lineCount = rec.getLineCount({ sublistId: 'item' });
            let updated = false;
            const defaultLocationId = 8;

            for (let i = 0; i < lineCount; i++) {
                const currentLocation = rec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'location',
                    line: i,
                });
                
                // Skip if already set
                if (currentLocation){
                    log.debug(`Line ${i}`, `Location already set to ${currentLocation}`);
                    continue;
                } 
                
                rec.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'location',
                    line: i,
                    value: defaultLocationId
                });

                updated = true;
                log.debug(`Line ${i}`, `Location set to ${defaultLocationId}`);
            }

            if (updated) {
                rec.save({ enableSourcing: false, ignoreMandatoryFields: true });
                log.debug('Record Updated', `Record ID: ${recId}`);
            } else {
                log.debug('No Update', `No default location needed for record ID: ${recId}`)
            }
        
        } catch (e) {
            log.error('Error Setting Default Location', e.toString());
        }
    }

    return { afterSubmit };
});