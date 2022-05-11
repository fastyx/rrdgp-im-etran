let config = {};
const ENV_PREFIX = 'RRDGP';

// Читаем конфиг-файлы на основе переменной окружения NODE_ENV
if (process.env.NODE_ENV) {
    config = require(`./config/config.${process.env.NODE_ENV}.json`);
}
else {
    config = require('./config/config.json');
}

// Обновляем конфиг на основе значений переменных окружения
for (const envVar in process.env) {
    if (!envVar || !envVar.startsWith(`${ENV_PREFIX}_`)) {
        continue;
    }
    const parts = envVar.split('_');
    let cfg = config;
    for (let i = 1; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!cfg[part]) {
            cfg[part] = {};
        }
        cfg = cfg[part];
    }
    cfg[parts[parts.length - 1]] = process.env[envVar];
}

module.exports = config;