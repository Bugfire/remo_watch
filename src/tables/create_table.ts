/**
 * @license remo_watch
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import * as dbUtil from "../common/dbutil";

import { LoadConfig } from "../myconfig";

if (process.argv.length <= 2) {
  throw new Error("Invalid argument. Specify top directory of config.");
}

const CONFIG = LoadConfig(`${process.argv[2]}config/config.json`);

const run = async (): Promise<void> => {
  const queries = [
    `CREATE TABLE ${CONFIG.db.name}.${CONFIG.table} (datetime DATETIME NOT NULL, remo_id VARCHAR(128) NOT NULL, te FLOAT, hu FLOAT, il FLOAT, mo FLOAT, UNIQUE (datetime, remo_id), INDEX (datetime), INDEX (remo_id));`
  ];
  console.log(queries);
  await dbUtil.connectAndQueries(CONFIG.db, queries);
  process.exit(0);
};

run();
