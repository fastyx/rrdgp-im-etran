const config = require('../../init_config');

var appRouter = async function (app) {
    // Информационный сервис (печать версии, доступность базы)
    app.get(`/${config.SYSTEM.restConfig.isrun.name}`, async function (req, res) {
        res.status(200).send('Ok!');
    });
}

module.exports = appRouter;
