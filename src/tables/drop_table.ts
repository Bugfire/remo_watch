/**
 * @license remo_watch
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import * as dbUtil from "../dbutil";

import { LoadConfig } from "../myconfig";

if (process.argv.length <= 2) {
  throw new Error("Invalid argument. Specify top directory of config.");
}

const CONFIG = LoadConfig(`${process.argv[2]}config/config.json`);

const run = async (): Promise<void> => {
  const queries = [`DROP TABLE ${CONFIG.db.name}.${CONFIG.table};`];
  console.log(queries);
  await dbUtil.connectAndQueries(CONFIG.db, queries);
  process.exit(0);
};

run();
