/**
 * @license remo_watch
 * (c) 2019 Bugfire https://bugfire.dev/
 * License: MIT
 */

import { default as Axios } from "axios";

export const DEVICES_URI = "https://api.nature.global/1/devices";

export interface RemoDevice {
  id: string;
  temperature_offset: number;
  humidity_offset: number;
  newest_events: {
    hu: RemoDeviceEvent;
    il: RemoDeviceEvent;
    mo: RemoDeviceEvent;
    te: RemoDeviceEvent;
  };
}

// te: temparature (temperature_offset)
// hu: humidity (humidity_offset)
// il: illuminance
// mo: motion

export interface RemoDeviceEvent {
  val: number;
  created_at: string;
}

export const getDevices = async (token: string): Promise<RemoDevice[]> => {
  const apiResult = await Axios.get(DEVICES_URI, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  });
  return apiResult.data;
};

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
