/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/record'], (record) => {

    function afterSubmit(context) {
        try {
            if (context.type !== context.UserEventType.EDIT) return;

            const newRecord = context.newRecord;

            const status = newRecord.getValue({ fieldId: 'orderstatus' });
            // 'B' = Pending Fulfillment (Approved)
            if (status !== 'B') return;

            const salesOrderId = newRecord.id;

            log.debug('Sales Order Approved', 'Creating Customer Deposit for SO ID: ' + salesOrderId);

            // Create Customer Deposit
            const customerDeposit = record.create({
                type: record.Type.CUSTOMER_DEPOSIT,
                isDynamic: true
            });

            // Link to Customer
            const customerId = newRecord.getValue({ fieldId: 'entity' });
            customerDeposit.setValue({
                fieldId: 'customer',
                value: customerId
            });

            // Link to Sales Order
            customerDeposit.setValue({
                fieldId: 'salesorder',
                value: salesOrderId
            });

            // Deposit full amount of the Sales Order
            const totalAmount = newRecord.getValue({ fieldId: 'total' });
            customerDeposit.setValue({
                fieldId: 'payment',
                value: totalAmount
            });

            const depositId = customerDeposit.save();
            log.audit('Customer Deposit Created', 'Deposit ID: '+ depositId);


        } catch (e) {
            log.error('Error in afterSubmit', e);
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});