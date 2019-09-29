/**
 * @license remo_watch
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import * as fs from "fs";

import { LoadConfig as LC, ConfigType } from "./common/config";
import { DBConfig, DBConfigType } from "./common/dbutil";

interface MyConfig {
  db: DBConfig;
  table: string;
  token: string;
  devices: {
    id: string;
    name: string;
  }[];
}

/* eslint-disable @typescript-eslint/camelcase */

const MyConfigType: ConfigType = {
  db: DBConfigType,
  table: "",
  token: "",
  devices: [
    {
      id: "",
      name: ""
    }
  ]
};

/* eslint-enable @typescript-eslint/camelcase */

export const LoadConfig = (filename: string): MyConfig => {
  return LC<MyConfig>(fs.readFileSync(filename, "utf8"), MyConfigType);
};
