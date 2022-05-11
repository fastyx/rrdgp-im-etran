const { Pool } = require('pg');
const config = require('./init_config');

var pool = new Pool({
    host: config.SYSTEM.dbConnections.dbrzd.host,
    port: config.SYSTEM.dbConnections.dbrzd.port,
    database: config.SYSTEM.dbConnections.dbrzd.database,
    user: config.SYSTEM.dbConnections.dbrzd.user,
    password: config.SYSTEM.dbConnections.dbrzd.password,
    max: config.SYSTEM.dbConfig.max,
    idleTimeoutMillis: config.SYSTEM.dbConfig.idleTimeoutMillis,
    connectionTimeoutMillis: config.SYSTEM.dbConfig.connectionTimeoutMillis,
})

module.exports = pool;