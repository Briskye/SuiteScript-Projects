/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/record', 'N/runtime', 'N/log', 'N/search'], (record, runtime, log, search) => {

    const getNearestOpenDate = () => {

        const periodSearch = search.create({
            type: search.Type.ACCOUNTING_PERIOD,
            filters: [
                ["closed","is","F"]   // ONLY safe filter your account supports
            ],
            columns: [
                search.createColumn({
                    name: "startdate",
                    sort: search.Sort.ASC
                }),
                "enddate"
            ]
        });

        const result = periodSearch.run().getRange({ start: 0, end: 1 });

        if (!result || result.length === 0) {
            log.error("NO_OPEN_PERIOD", "No open accounting period found. Falling back to today.");
            return new Date();
        }

        const start = result[0].getValue("startdate");
        const date = new Date(start);

        log.audit("OPEN_PERIOD_PICKED", `Using open period starting: ${start}`);

        return date;
    };



    const getInputData = () => {
        return [
            { action: 'CREATE_SO', customer: 728, amount: 15000 }
        ];
    };

    const map = (context) => {
        const task = JSON.parse(context.value);

        context.write({
            key: task.action,
            value: JSON.stringify(task)
        });
    };

    const reduce = (context) => {

        context.values.forEach(value => {

            let task;
            let soId, invId, payId;

            try {

                task = JSON.parse(value);
                log.audit('TASK START', task);

                const openPostingDate = getNearestOpenDate();

                const so = record.create({
                    type: record.Type.SALES_ORDER,
                    isDynamic: true
                });

                so.setValue('entity', task.customer);

                so.selectNewLine({ sublistId: 'item' });
                so.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: '159'
                });
                so.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    value: task.amount
                });
                so.commitLine({ sublistId: 'item' });

                so.setValue('orderstatus', 'B');
                so.setValue('custbody_auto_approve_so', true);

                so.setValue({
                    fieldId: 'trandate',
                    value: openPostingDate
                });

                try {
                    soId = so.save();
                } catch (soErr) {
                    log.audit('SO save failed, retrying with open period', soErr);
                    so.setValue({ fieldId: 'trandate', value: openPostingDate });
                    soId = so.save();
                }

                log.audit('CREATED SO', soId);


                const invoice = record.transform({
                    fromType: record.Type.SALES_ORDER,
                    fromId: soId,
                    toType: record.Type.INVOICE,
                    isDynamic: true
                });

                invoice.setValue({
                    fieldId: 'trandate',
                    value: openPostingDate
                });

                try {
                    invId = invoice.save();
                } catch (invErr) {
                    log.audit('Invoice save failed, retrying with open period', invErr);
                    invoice.setValue({ fieldId: 'trandate', value: openPostingDate });
                    invId = invoice.save();
                }

                log.audit('CREATED INVOICE', invId);


                const payment = record.create({
                    type: record.Type.CUSTOMER_PAYMENT,
                    isDynamic: true
                });

                payment.setValue('customer', task.customer);
                payment.setValue('payment', task.amount);

                payment.setValue({
                    fieldId: 'trandate',
                    value: openPostingDate
                });

                let paymentSaved = false;

                try {

                    const applyLineCount = payment.getLineCount({ sublistId: 'apply' });

                    for (let i = 0; i < applyLineCount; i++) {

                        const lineInvId = payment.getSublistValue({
                            sublistId: 'apply',
                            fieldId: 'internalid',
                            line: i
                        });

                        if (lineInvId == invId) {
                            payment.selectLine({ sublistId: 'apply', line: i });
                            payment.setCurrentSublistValue({
                                sublistId: 'apply',
                                fieldId: 'apply',
                                value: true
                            });
                            payment.commitLine({ sublistId: 'apply' });
                            break;
                        }
                    }

                    payment.setValue({
                        fieldId: 'account',
                        value: 1
                    });

                    payId = payment.save();
                    paymentSaved = true;

                } catch (payErr) {

                    log.audit('Payment save failed, retrying with open period', payErr);

                    payment.setValue({
                        fieldId: 'trandate',
                        value: openPostingDate
                    });

                    const applyLineCount2 = payment.getLineCount({ sublistId: 'apply' });

                    for (let i = 0; i < applyLineCount2; i++) {

                        const lineInvId = payment.getSublistValue({
                            sublistId: 'apply',
                            fieldId: 'internalid',
                            line: i
                        });

                        if (lineInvId == invId) {
                            payment.selectLine({ sublistId: 'apply', line: i });
                            payment.setCurrentSublistValue({
                                sublistId: 'apply',
                                fieldId: 'apply',
                                value: true
                            });
                            payment.commitLine({ sublistId: 'apply' });
                            break;
                        }
                    }

                    payment.setValue({
                        fieldId: 'account',
                        value: 1
                    })

                    payId = payment.save();
                    paymentSaved = true;
                }

                if (paymentSaved) {
                    log.audit('CREATED PAYMENT', payId);
                }

                context.write(task.customer, `SO:${soId} - INV:${invId} - PAY:${payId}`);

            } catch (e) {

                log.error('TASK FAILED', {
                    error: e,
                    rawValue: value,
                    parsedTask: task
                });

                context.write('ERROR', e.message);
            }

        });
    };

    const summarize = (summary) => {

        log.audit('MR USAGE', summary.usage);
        log.audit('MR CONCURRENCY', summary.concurrency);
        log.audit('MR YIELDS', summary.yields);

        summary.output.iterator().each((key, value) => {
            log.audit('RESULT', `${key} => ${value}`);
            return true;
        });

        if (summary.inputSummary.error)
            log.error('INPUT ERROR', summary.inputSummary.error);

        summary.mapSummary.errors.iterator().each((key, e) => {
            log.error('MAP ERROR ' + key, e);
            return true;
        });

        summary.reduceSummary.errors.iterator().each((key, e) => {
            log.error('REDUCE ERROR ' + key, e);
            return true;
        });
    };

    return { getInputData, map, reduce, summarize };
});
