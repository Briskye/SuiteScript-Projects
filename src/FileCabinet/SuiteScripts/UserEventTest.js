/** 
* @NApiVersion 2.x
* @NScriptType UserEventScript
*/

define(['N/record', 'N/log'], function(record, log) {
    function beforeSubmit(context) {
        var newRecord= context.newRecord;
        log.debug('Triggered on Save', 'Record ID: ' + newRecord.id);
    }

    return {
        beforeSubmit: beforeSubmit
    };
});

