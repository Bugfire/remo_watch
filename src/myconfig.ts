
/**
 * @license remo_watch
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import * as fs from "fs";

import { LoadConfig as LC, ConfigType } from "./config";
import { DBConfig, DBConfigType } from "./dbutil";

interface MyConfig {
  db: DBConfig;
  table: string;
  token: string;
  devices: {
    id: string;
    name: string;
  }[]
}
  
const MyConfigType: ConfigType = {
  db: DBConfigType,
  table: "string",
  token: "string",
  devices_array: {
    id: "string",
    name: "string"
  }
};
  
export const LoadConfig = (filename: string) => {
  return LC<MyConfig>(
    fs.readFileSync(filename, "utf8"),
    MyConfigType
  );
};