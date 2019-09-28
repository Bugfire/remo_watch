/**
 * @license remo_watch
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import * as cron from "cron";

import * as dbUtil from "./common/dbutil";
import * as RemoAPI from "./remoapi";

import { LoadConfig } from "./myconfig";

if (process.argv.length <= 2) {
  throw new Error("Invalid argument. Specify top directory of config.");
}

const IS_DRYRUN = process.env["NODE_ENV"] === "DRYRUN";
const IS_DEBUG = IS_DRYRUN || process.env["NODE_ENV"] === "DEBUG";
const CONFIG = LoadConfig(`${process.argv[2]}config/config.json`);

const run = async (): Promise<void> => {
  const remoDevices = await RemoAPI.getDevices(CONFIG.token);
  const queries: string[] = [];
  remoDevices.forEach(v => {
    const f = CONFIG.devices.find(
      (d: { id: string; name: string }) => v.id === d.id
    );
    if (typeof f === "undefined") {
      console.error(`Unknown device [${v.id}]`);
      return;
    }
    const remoId = f.name;
    const r: { [key: string]: number | string } = {};
    const newestEvent = v.newest_events as {
      [key: string]: undefined | RemoAPI.RemoDeviceEvent;
    };
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

  if (IS_DEBUG) {
    console.log(queries);
  }
  if (!IS_DRYRUN) {
    dbUtil.connectAndQueries(CONFIG.db, queries);
  }
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
  if (!IS_DRYRUN) {
    new cron.CronJob("5 * * * * *", wrappedRun, undefined, true);
  }
};

kick();
