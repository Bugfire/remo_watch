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
  const queries = [`DROP TABLE ${CONFIG.db.name}.${CONFIG.table};`];
  await dbUtil.connectAndQueries(CONFIG.db, queries);
};

run();
