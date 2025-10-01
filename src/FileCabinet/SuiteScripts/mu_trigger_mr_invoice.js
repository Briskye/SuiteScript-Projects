/**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 */

define(['N/task', 'N/log'], (task, log) => {

    function each(params) {
        try {
            const mrTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_mr_export_invoice',
                deploymentId: 'customdeploy_mr_export_invoice',
                params: {
                    custscript_export_invoice_id: params.id
                }
            });

            const taskId = mrTask.submit();
            log.audit('Mass Update Trigger', `Started MR Task: ${taskId} for Invoice ${params.id}`);
        } catch (e) {
            log.error('Mass Update Error', e.message);
        }
    }

    return { each };
});