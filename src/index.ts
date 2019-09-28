/**
 * @license remo_watch
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
    const remoId: string = CONFIG.devices[v.id];
    if (typeof remoId !== "string") {
      console.error(
        `Unknown or Invalid device [${v.id}] [${remoId}]`
      );
      return;
    }
    const r: { [key: string]: number | string } = {};
    const newestEvent = v.newest_events as { [key: string]: undefined | RemoAPI.RemoDeviceEvent };
    ["te", "hu", "il", "mo"].forEach(attr => {
      const p = newestEvent[attr];
      r[attr] = typeof p === "undefined" ? "NULL" : p.val;
    });
    // const timestamp = isoDateToJST(te.created_at);
    const timestamp = dbUtil.getDateJST();
    queries.push(
      `INSERT INTO ${CONFIG.db.name}.${CONFIG.table} (datetime, remo_id, te, hu, il, mo) VALUES ("${timestamp}", "${remoId}", ${r.te}, ${r.hu}, ${r.il}, ${r.mo})`
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
  new cron.CronJob("05 * * * * *", wrappedRun, undefined, true);
};

kick();
