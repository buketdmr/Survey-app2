const config = require('../../config/config');
const ibm_db = require('ibm_db');

var Pool = require('ibm_db').Pool;
var pool = new Pool();
pool.init(5, config.db.dsn);
pool.setMaxPoolSize(5);

module.export = pool.open(config.db.dsn, function(ex, db) {
  if (ex) {
    next(ex);
  }

  return db;
});