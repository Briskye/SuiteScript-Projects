/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */

define(['N/record', 'N/error'], (record, error) => {

    function post(context) {
        try {
            if (!context.customer || !context.items || !Array.isArray(context.items)) {
                throw error.create({
                    name: 'INVALID_INPUT',
                    message: 'Customer and items array are required'
                });
            }

            let salesOrder = record.create({
                type: record.Type.SALES_ORDER,
                isDynamic: true
            });

            salesOrder.setValue({
                fieldId: 'entity',
                value: context.customer
            });

            if (context.orderDate) {
                salesOrder.setValue({
                    fieldId: 'trandate',
                    value: new Date(context.orderDate)
                });
            }

            context.items.forEach(function(item) {
                salesOrder.selectNewLine({
                    sublistId: 'item'
                });

                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: item.itemId
                });

                salesOrder.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    value: item.quantity || 1
                });

                salesOrder.commitLine({
                    sublistId: 'item'
                });
            });

            let salesOrderId = salesOrder.save({
                ignoreMandatoryFields: false
            });

            return{
                status: 'success',
                salesOrderId: salesOrderId
            };

        } catch (e) {
            return{
                status: 'error',
                message: e.message,
                code: e.name
            };
        }
    }

    return {
        post: post
    };
});

    /* JSON in Postman Body
    {
    "customer": 420, 
    "orderDate": "2025-06-05",
    "items": [
        {
        "itemId": 159,
        "quantity": 2
        },
        {
        "itemId": 158,
        "quantity": 1
        }
      ]
    } */
