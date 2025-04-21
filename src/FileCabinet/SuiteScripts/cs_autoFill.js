/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/currentRecord', 'N/ui/message'], (currentRecord, message) => {

    function fieldChanged(context) {
        if (context.fieldId === 'firstname') {
            var record = currentRecord.get();
            var firstName = record.getValue({ fieldId: 'firstname'});

            if (firstName && firstName.toLowerCase() ==='john') {

                var alreadySet = record.getValue({ fieldId: 'lastname' });
                
                if (!alreadySet) {

                record.setValue({ fieldId: 'lastname', value: 'Mendoza' });
                record.setValue({ fieldId: 'title', value: 'Developer' });
                record.setValue({ fieldId: 'email', value: 'john.mendoza@example.com' });

                message.create({
                    title: "Field Auto-Filled",
                    message: "Last Name, Job Title, and Email were set automatically",
                    type: message.Type.CONFIRMATION
                }).show({ duration: 2000 });
            }
            }
        }
    }
    return {
        fieldChanged: fieldChanged
    };
});