module.exports.getXmlConfig = function (req) {

    // Конфигурация для request_claim
    let claim_root_route = null;
    let claim_doc_route = null;
    if (typeof req.body.requestclaim !== 'undefined') {
        claim_root_route = req.body.requestclaim;
        if (typeof req.body.requestclaim.claim !== 'undefined') {
            claim_doc_route = req.body.requestclaim.claim;
        }
    }

    // Конфигурация для request_invoice
    let invoice_root_route = null;
    let invoice_doc_route = null;
    if (typeof req.body.requestinvoice !== 'undefined') {
        invoice_root_route = req.body.requestinvoice;
        if (typeof req.body.requestinvoice.invoice !== 'undefined') {
            invoice_doc_route = req.body.requestinvoice.invoice;
        }
    }

    // Конфигурация для request_gu_2b
    let gu_2b_root_route = null;
    let gu_2b_doc_route = null;
    if (typeof req.body.requestnotification !== 'undefined') {
        gu_2b_root_route = req.body.requestnotification;
        if (typeof req.body.requestnotification.notificationgu2b !== 'undefined') {
            gu_2b_doc_route = req.body.requestnotification.notificationgu2b;
        }
    }

    // Конфигурация для request_gu_45
    let gu_45_root_route = null;
    let gu_45_doc_route = null;
    if (typeof req.body.requestnotification !== 'undefined') {
        gu_45_root_route = req.body.requestnotification;
        if (typeof req.body.requestnotification.pps !== 'undefined') {
            gu_45_doc_route = req.body.requestnotification.pps;
        }
    }

    // Конфигурация для request_gu_46
    let gu_46_root_route = null;
    let gu_46_doc_route = null;
    if (typeof req.body.requestnotification !== 'undefined') {
        gu_46_root_route = req.body.requestnotification;
        if (typeof req.body.requestnotification.vpu !== 'undefined') {
            gu_46_doc_route = req.body.requestnotification.vpu;
        }
    }

    // Конфигурация для request_fdu_92
    let fdu_92_root_route = null;
    let fdu_92_doc_route = null;
    if (typeof req.body.requestnotification !== 'undefined') {
        fdu_92_root_route = req.body.requestnotification;
        if (typeof req.body.requestnotification.cum !== 'undefined') {
            fdu_92_doc_route = req.body.requestnotification.cum;
        }
    }

    //Тестового запроса для проверки работоспособности
    let testcon_root_route = null;
    if (typeof req.body.test !== 'undefined') {
        testcon_root_route = req.body.test;
    }

    // Выходная ифномация
    return xmlConfig = {
        "claim_root_route": claim_root_route,
        "claim_doc_route": claim_doc_route,
        "invoice_root_route": invoice_root_route,
        "invoice_doc_route": invoice_doc_route,
        "gu_2b_root_route": gu_2b_root_route,
        "gu_2b_doc_route": gu_2b_doc_route,
        "gu_45_root_route": gu_45_root_route,
        "gu_45_doc_route": gu_45_doc_route,
        "gu_46_root_route": gu_46_root_route,
        "gu_46_doc_route": gu_46_doc_route,
        "fdu_92_root_route": fdu_92_root_route,
        "fdu_92_doc_route": fdu_92_doc_route,
        "testcon_root_route": testcon_root_route 
    };
}