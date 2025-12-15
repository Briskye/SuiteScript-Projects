/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/log'], (search, log) => {

    const getInputData = () => {
        return search.create({
            filters: [
                ['mainline', 'is', 'T']
            ],
            columns: [
                'entity',
                'total'
            ]
        });
    };

    const map = (context) => {
        const result = JSON.parse(context.value);

        const customerId = result.values.entity.value;
        const amount = parseFloat(result.values.total || 0);

        context.write({
            key: customerId,
            value: JSON.stringify({ amount })
        });
    };

    const reduce = (context) => {
        let customerTotal = 0;

        context.values.forEach(value => {
            const obj = JSON.parse(value);
            const amount = Number(obj.amount || 0);
            customerTotal += amount;
        });

        context.write({
            key: context.key,
            value: customerTotal
        });
    };

    return { getInputData, map, reduce };
});