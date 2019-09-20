/**
 * @license remo_watch
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import * as fs from "fs";

import * as dbUtil from "../dbutil";
import { Config } from "../config";

if (process.argv.length <= 2) {
  throw new Error("Invalid argument. Specify top directory of config.");
}
const CONFIG = new Config(
  fs.readFileSync(`${process.argv[2]}config/config.json`, "utf8")
);

const run = async (): Promise<void> => {
  const queries = [
    `CREATE TABLE ${CONFIG.db.name}.${CONFIG.table} (datetime DATETIME NOT NULL, remo_id VARCHAR(128) NOT NULL, te FLOAT, hu FLOAT, il FLOAT, mo FLOAT, UNIQUE (datetime, remo_id), INDEX (datetime), INDEX (remo_id));`
  ];
  console.log(queries);
  await dbUtil.connectAndQueries(CONFIG.db, queries);
  process.exit(0);
};

run();
