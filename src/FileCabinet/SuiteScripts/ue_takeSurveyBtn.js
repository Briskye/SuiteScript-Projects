/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/ui/serverWidget', 'N/runtime'], (serverWidget, runtime) => {

    const beforeLoad = (context) => {
        if (context.type !== context.UserEventType.VIEW) return;

        const form = context.form;
       // const customerId = context.newRecord.id;

        const suiteletURL = `/app/site/hosting/scriptlet.nl?script=647&deploy=1`;

        form.addButton({
            id: 'custpage_survey_button',
            label: 'Take Survey',
            functionName: 'redirectToSurvey'
        });

        form.clientScriptModulePath = 'SuiteScripts/John Files/cs_surveyRedirect.js'
    }

    return {
        beforeLoad
    };
});