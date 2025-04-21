/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/log', 'N/ui/dialog'], (log, dialog) => {
    
    let previousLineCount = 0;

    const pageInit = (context) => {
        try {
            const currentRecord = context.currentRecord;
            previousLineCount = currentRecord.getLineCount({ sublistId: 'submachine'});
            log.debug('Page Init', `Initial subsidiary line: ${previousLineCount}`);
        }
        catch (e) {
            log.error('Error in pageInit', e);
        }
    };

    const sublistChanged = (context) => {
        try {
            if (context.sublistId === 'submachine') {
                const currentRecord = context.currentRecord;
                const currentLineCount = currentRecord.getLineCount({ sublistId: 'submachine'});

                if (currentLineCount < previousLineCount) {
                    dialog.alert({
                        title: 'Subsidiary Removed',
                        message: 'Subsidiary has been successfully Removed!'
                    });
                }

                previousLineCount = currentLineCount;
            }
        }
        catch (e) {
            log.error('Error in sublistChanged', e);
        }
    };

    return {
        pageInit,
        sublistChanged
    };
});