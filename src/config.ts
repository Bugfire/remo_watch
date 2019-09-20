/**
 * @license remo_watch
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import * as dbUtil from "./dbutil";

export class Config {
  public readonly db: dbUtil.Config;
  public readonly table: string;
  public readonly token: string;
  public readonly devices: { [key: string]: string };

  public constructor(configString: string) {
    const json = JSON.parse(configString);

    this.db = json.db;
    this.table = json.table;
    this.token = json.token;
    this.devices = json.devices;

    dbUtil.validateConfig(this.db);

    const errorNames = ["table", "token"]
      .filter(v => typeof this[v] !== "string")
      .join(", ");
    if (errorNames !== "") {
      throw new Error(`Invalid Config [${errorNames}] is not string`);
    }

    return this;
  }
}
