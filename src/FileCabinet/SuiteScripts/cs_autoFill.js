/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/currentRecord', 'N/ui/message'], (currentRecord, message) => {

    function fieldChanged(context) {

        // Check if the field that changed is 'firstname'
        if (context.fieldId === 'firstname') {
            var record = currentRecord.get();

            // Get the new value entered into the 'firstname' field
            var firstName = record.getValue({ fieldId: 'firstname'});

            // Check if the first name is 'john'
            if (firstName && firstName.toLowerCase() ==='john') {

                // Check if 'lastname' is already set to avoid overwriting existing data
                var alreadySet = record.getValue({ fieldId: 'lastname' });
                
                if (!alreadySet) {
                
                // Set default values for lastname, title, and email
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