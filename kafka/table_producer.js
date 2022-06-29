var cron = require('node-cron');
const config = require(`../init_config`);
const pool = require('../init_db_pool');

cron.schedule('* * * * *', async () => {
  console.log('running a task every minute');


  try {
    client = await pool.connect();

    try {
      var sql = `SELECT ${config.SYSTEM.dbFunctions.imesGetNext} ($1,$2)`;
      result = await client.query(sql,
        [
          1,
          100
        ]
      );

      console.log(result)
    } catch (e) {
      logger.error(e);
    }
    finally {
      await client.release();
    }
  } catch (e) {
    logger.error(e);
  }
});