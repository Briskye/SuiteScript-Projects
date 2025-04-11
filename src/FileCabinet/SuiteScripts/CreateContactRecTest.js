/**
 * @NApiVersion 2.1
 */

define (['N/record'], record => {
    // Create an object to hold name data for contact
    const nameData = {
        firstname: 'John Martin',
        middlename: 'Martinez',
        lastname: 'Mendoza'
    };

    // Create a contact record
    let objRecord = record.create({
        type: record.Type.CONTACT,
        isDynamic: boolean,
    });


    // Set values of the firstname, middlename, lastname.
    objRecord.setValue({
        fieldId: '',
        value: ''
    });

    for (let key in nameData) {
        if (nameData.hasOwnProperty(key)) {
            objRecord.setValue({
                fieldId: '',
                value: nameData[key]
            });
        }
    }

    // Save the record
    let recordId = objRecord.save({
        enableSourcing: false,
        ignoreMandatoryFields: false
    });
});