/** 
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/log'], (log) => {

    try {
        function beforeLoad(context) {
            if (context.type !== context.UserEventType.VIEW &&
                context.type !== context.UserEventType.CREATE &&
                context.type !== context.UserEventType.EDIT) {
                    return;
            }

            const form = context.form;

            // To target the field i want to hide or disable
            const emailField = form.getField({ id: 'email' });
            if (emailField) {
                emailField.updateDisplayType({
                    displayType: 'disabled'
                });
            }
        }
    }
    catch (e) {
        log.error('Error in beforeLoad', e.message)
    }
    return {
        beforeLoad
    }
});