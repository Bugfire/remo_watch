/**
 * @license remo_watch v0.1
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import * as fs from "fs";
import * as cron from "cron";
import * as dbUtil from "./dbutil";
import * as RemoAPI from "./remoapi";
import { Config } from "./config";

if (process.argv.length <= 2) {
  throw new Error("Invalid argument. Specify top directory of config.");
}
const CONFIG = new Config(
  fs.readFileSync(`${process.argv[2]}config/config.json`, "utf8")
);

const run = async (): Promise<void> => {
  const remoDevices = await RemoAPI.getDevices(CONFIG.token);
  const queries: string[] = [];
  remoDevices.forEach(v => {
    if (typeof CONFIG.devices[v.id] !== "string") {
      console.error(
        `Unknown or Invalid device [${v.id}] [${CONFIG.devices[v.id]}]`
      );
      return;
    }
    const remoId: string = CONFIG.devices[v.id];
    const { te, hu, il, mo } = v.newest_events;
    const teVal = typeof te === "undefined" ? "NULL" : te.val;
    const huVal = typeof hu === "undefined" ? "NULL" : hu.val;
    const ilVal = typeof il === "undefined" ? "NULL" : il.val;
    const moVal = typeof mo === "undefined" ? "NULL" : mo.val;
    // const timestamp = isoDateToJST(te.created_at);
    const timestamp = dbUtil.getDateJST();
    queries.push(
      `INSERT INTO ${CONFIG.db.name}.${CONFIG.table} (datetime, remo_id, te, hu, il, mo) VALUES ("${timestamp}", "${remoId}", ${teVal}, ${huVal}, ${ilVal}, ${moVal})`
    );
  });
  dbUtil.connectAndQueries(CONFIG.db, queries);
};

const wrappedRun = async (): Promise<void> => {
  try {
    await run();
  } catch (ex) {
    console.error(ex);
  }
};

const kick = async (): Promise<void> => {
  await wrappedRun();
  new cron.CronJob("05 * * * * *", wrappedRun, null, true);
};

kick();
