import { db } from "@/database/connection";
import type {
  TMeasurement,
  TWeatherStation,
  TWeatherVariable,
} from "@/database/types";

type StationDetailsWithLatestMeasurements = TWeatherStation & {
  latest_measurements: {
    long_name: TWeatherVariable["long_name"];
    unit: TWeatherVariable["unit"];
    value: TMeasurement["value"];
    timestamp: TMeasurement["timestamp"];
  }[];
};

type LatestMeasurementsForStation = {
  name: TWeatherVariable["name"];
  unit: TWeatherVariable["unit"];
  long_name: TWeatherVariable["long_name"];
  value: TMeasurement["value"];
  timestamp: TMeasurement["timestamp"];
};

export class WeatherStation {
  static all(): TWeatherStation[] {
    return db
      .prepare(
        `SELECT id, name, site, portfolio, state, latitude, longitude FROM weather_stations`
      )
      .all() as TWeatherStation[];
  }

  static findById(
    stationId: number
  ): StationDetailsWithLatestMeasurements | null {
    const foundStation = db
      .prepare(
        `SELECT id, name, site, portfolio, state, latitude, longitude FROM weather_stations WHERE id = ?`
      )
      .get(stationId) as StationDetailsWithLatestMeasurements | undefined;

    return foundStation || null;
  }

  static getLatestMeasurementsForEachStationVariable(
    stationId: number
  ): LatestMeasurementsForStation[] {
    // Get all variables for the station
    const stationVariableIds = db
      .prepare(`SELECT id from weather_variables WHERE weather_station_id = ?`)
      .all(stationId) as Pick<TWeatherVariable, "id">[];

    const latestMeasurements: LatestMeasurementsForStation[] = [];

    // Find latest measurement for each variable id
    stationVariableIds.forEach(({ id: variableId }) => {
      const latestMeasurementForThisVariable = db
        .prepare(
          `SELECT weather_variables.name, weather_variables.unit, weather_variables.long_name, measurements.value, measurements.timestamp
          FROM measurements
          INNER JOIN weather_variables ON weather_variables.id = measurements.variable_id
          WHERE measurements.variable_id = ?
          ORDER BY measurements.timestamp
          DESC LIMIT 1`
        )
        .all(variableId)[0] as LatestMeasurementsForStation | undefined;

      if (latestMeasurementForThisVariable) {
        latestMeasurements.push(latestMeasurementForThisVariable);
      }
    });

    return latestMeasurements;
  }
}
