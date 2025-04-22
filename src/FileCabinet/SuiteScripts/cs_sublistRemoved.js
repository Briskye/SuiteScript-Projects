/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/log', 'N/ui/dialog'], (log, dialog) => {
    
    // Variable to keep track of the previous line count in the 'submachine' sublist
    let previousLineCount = 0;

    const pageInit = (context) => {
        try {
            const currentRecord = context.currentRecord;

            // Get the number of lines in the 'submachine' sublist when the page loads
            previousLineCount = currentRecord.getLineCount({ sublistId: 'submachine'});

             // Log the initial line count to the NetSuite execution log
            log.debug('Page Init', `Initial subsidiary line: ${previousLineCount}`);
        }
        catch (e) {
            log.error('Error in pageInit', e);
        }
    };

    const sublistChanged = (context) => {
        try {
            // Check if the changed sublist is 'submachine'
            if (context.sublistId === 'submachine') {
                const currentRecord = context.currentRecord;

                // Get the updated line count of the 'submachine' sublist
                const currentLineCount = currentRecord.getLineCount({ sublistId: 'submachine'});

                // Compare with the previous count to detect if a line was removed
                if (currentLineCount < previousLineCount) {

                    // Show a dialog alert if a line was removed
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