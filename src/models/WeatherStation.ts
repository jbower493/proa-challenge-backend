import { db } from "@/database/connection";
import type { TWeatherStation } from "@/database/types";

export class WeatherStation {
  static all() {
    return db
      .prepare(
        `SELECT id, name, site, portfolio, state, latitude, longitude FROM weather_stations`
      )
      .all() as TWeatherStation[];
  }
}
