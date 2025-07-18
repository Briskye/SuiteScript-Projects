/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/record', 'N/search', 'N/redirect', 'N/log'], (serverWidget, record, search, redirect, log) => {

    function onRequest(context) {
        if (context.request.method === 'GET') {
            // Create a new form
            const form = serverWidget.createForm({
                title: 'Create Invoice'
            });

            // Add a customer dropdown sourced from NetSuite's customer list
            form.addField({
                id: 'custpage_customer',
                type: serverWidget.FieldType.SELECT,
                label: 'Customer',
                source: 'customer'
            }).isMandatory = true;

            // Add an item dropdown sourced from item records
            form.addField({
                id: 'custpage_item',
                type: serverWidget.FieldType.SELECT,
                label: 'Item',
                source: 'item'
            }).isMandatory = true;

            // Add quantity input field, defaulting to 1
            form.addField({
                id: 'custpage_quantity',
                type: serverWidget.FieldType.INTEGER,
                label: 'Quantity'
            }).defaultValue = '1';

            // Add rate (price) input field, defaulting to 100
            form.addField({
                id: 'custpage_rate',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Rate'
            }).defaultValue = '100';

            // Add submit button to create the invoice
            form.addSubmitButton({
                label: 'Create Invoice'
            });

            context.response.writePage(form);

        } else if (context.request.method === 'POST') {
            try {
                const req = context.request;

                // Get values from submitted form
                const customerId = req.parameters.custpage_customer;
                const itemId = req.parameters.custpage_item;
                const quantity = parseInt(req.parameters.custpage_quantity, 10);
                const rate = parseFloat(req.parameters.custpage_rate);

                // Basic form validation
                if (!itemId || isNaN(parseInt(itemId))) {
                    throw new Error('Item is required and must be selected.');
                }
                if (!quantity || isNaN(quantity)) {
                    throw new Error('Quantity is required and must be a number.');
                }
                if(isNaN(rate)) {
                    throw new Error('Rate must be a number.');
                }

                // Log the submitted values for debugging
                log.debug('POST Values', {
                    itemId,
                    quantity,
                    rate,
                    customerId
                })

                // Create a new Invoice record in dynamic mode
                const invoice = record.create({
                    type: record.Type.INVOICE,
                    isDynamic: true
                });

                // Set the customer on the invoice
                invoice.setValue({
                    fieldId: 'entity',
                    value: customerId
                });

                // Set a fixed location
                invoice.setValue({
                    fieldId: 'location',
                    value: 8
                });

                // Add a line item to the invoice if valid item ID is provided
                if (itemId && !isNaN(parseInt(itemId))) {
                    invoice.selectNewLine({
                        sublistId: 'item'
                    });

                    invoice.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: parseInt(itemId)
                    });

                    invoice.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: quantity
                    });

                    invoice.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        value: rate
                    });

                     // Commit the line to the item sublist
                    invoice.commitLine({ sublistId: 'item' });
                }

                    // Save the invoice and get its internal ID
                    const invoiceId = invoice.save();
                    
                    // Redirect the user to the new invoice record in view mode
                    redirect.toRecord({
                        type: record.Type.INVOICE,
                        id: invoiceId
                    });

                } catch (e) {
                    log.error('Invoice Creation Failed', e.message);
                    context.response.write('Error: ' + e.message);
            }
        }
    }

    return { onRequest };
});