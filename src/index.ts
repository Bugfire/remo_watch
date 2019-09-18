// remo_watch

import * as fs from "fs";
import * as cron from "cron";
import * as mysql from "mysql";
import { default as Axios } from "axios";

if (process.argv.length <= 2) {
  throw new Error("Invalid argument. Specify top directory of config.");
}

const ROOT_DIR = process.argv[2];
const CONFIG_DIR = `${ROOT_DIR}config`;
const REMO_DEVICE_URI = "https://api.nature.global/1/devices";

interface Config {
  db: {
    host: string;
    name: string;
    user: string;
    password: string;
  };
  token: string;
  devices: { [key: string]: string };
}

interface RemoDevice {
  id: string;
  newest_events: {
    hu: RemoDeviceEvent;
    il: RemoDeviceEvent;
    mo: RemoDeviceEvent;
    te: RemoDeviceEvent;
  };
}

interface RemoDeviceEvent {
  val: number;
  created_at: string;
}

const CONFIG: Config = JSON.parse(
  fs.readFileSync(`${CONFIG_DIR}/config.json`, "utf8")
);

if (typeof CONFIG.token !== "string") {
  throw new Error(`Invalid config. TOKEN MUST BE STRING(${CONFIG.token})`);
}

/*
const isoDateToJST = (isoDate: string): string => {
  return (
    new Date(new Date(isoDate).getTime() + 9 * 3600 * 1000)
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "")
      .slice(0, -2) + "00"
  );
};
*/

const getDateJST = (): string => {
  return (
    new Date(new Date().getTime() + 9 * 3600 * 1000)
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "")
      .slice(0, -2) + "00"
  );
};

const dbConnect = (): mysql.Connection => {
  return mysql.createConnection({
    host: CONFIG.db.host,
    database: CONFIG.db.name,
    user: CONFIG.db.user,
    password: CONFIG.db.password,
    connectTimeout: 10000,
    supportBigNumbers: true
  });
};

const dbQuery = async (
  client: mysql.Connection,
  query: string
): Promise<{ [key: string]: number | string }[]> => {
  return new Promise((resolve, reject): void => {
    // console.log(query);
    client.query(query, (err, result: { [key: string]: number | string }[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const dbQueries = async (
  queries: string[]
): Promise<{ [key: string]: number | string }[][]> => {
  if (queries.length === 0) {
    return [];
  }
  const db = dbConnect();
  const r: { [key: string]: number | string }[][] = [];
  for (let i = 0; i < queries.length; i++) {
    try {
      r.push(await dbQuery(db, queries[i]));
    } catch (ex) {
      console.error(ex);
    }
  }
  db.end();
  return r;
};

const run = async (): Promise<void> => {
  const apiResult = await Axios.get(REMO_DEVICE_URI, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${CONFIG.token}`
    }
  });
  const queries: string[] = [];
  apiResult.data.forEach((v: RemoDevice) => {
    if (typeof CONFIG.devices[v.id] !== "string") {
      console.error(
        `Unknown or Invalid device [${v.id}] [${CONFIG.devices[v.id]}]`
      );
      return;
    }
    const tableName: string = CONFIG.devices[v.id];
    // const { hu, il, mo, te } = v.newest_events;
    const { te } = v.newest_events;
    const value = te.val;
    // const timestamp = isoDateToJST(te.created_at);
    const timestamp = getDateJST();
    queries.push(
      `INSERT INTO ${CONFIG.db.name}.${tableName} (Datetime,Val) VALUES ("${timestamp}", ${value})`
    );
  });
  dbQueries(queries);
};

const wrappedRun = async (): Promise<void> => {
  try {
    await run();
  } catch (ex) {
    console.log(ex);
  }
};

const kick = async (): Promise<void> => {
  await wrappedRun();
  new cron.CronJob("05 * * * * *", wrappedRun, null, true);
};

kick();

/* API Result
[
    {
        "name": "XXX",
        "id": "XXX",
        "created_at": "XXX",
        "updated_at": "2019-XX-XXTXX:XX:XXZ",
        "mac_address": "XX:XX:XX:XX:XX:XX",
        "serial_number": "XX",
        "firmware_version": "Remo/1.0.62-gabbf5bd",
        "temperature_offset": 0,
        "humidity_offset": 0,
        "users": [
            {
                "id": "XXX",
                "nickname": "XXX",
                "superuser": true
            }
        ],
        "newest_events": {
            "hu": {
                "val": XX,
                "created_at": "2019-XX-XXTXX:XX:XXZ"
            },
            "il": {
                "val": 3.4,
                "created_at": "2019-XX-XXTXX:XX:XXZ"
            },
            "mo": {
                "val": 1,
                "created_at": "2019-XX-XXTXX:XX:XXZ"
            },
            "te": {
                "val": 26,
                "created_at": "2019-XX-XXTXX:XX:XXZ"
            }
        }
    }
]
*/
