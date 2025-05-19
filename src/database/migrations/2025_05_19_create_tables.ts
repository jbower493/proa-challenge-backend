import { db } from "../connection";

try {
  // weather_stations
  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS weather_stations (
            id INTEGER PRIMARY KEY,
            name TEXT,
            site TEXT,
            portfolio TEXT,
            state TEXT,
            latitude REAL,
            longitude REAL
        )
    `
  ).run();

  // variables
  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS weather_variables (
            id INTEGER PRIMARY KEY,
            weather_station_id INTEGER,
            name TEXT,
            unit TEXT,
            long_name TEXT,
            FOREIGN KEY (weather_station_id) REFERENCES weather_stations(id)
        )
    `
  ).run();

  // measurements
  db.prepare(
    `
        CREATE TABLE IF NOT EXISTS measurements (
            id INTEGER PRIMARY KEY,
            weather_station_id INTEGER,
            variable_id INTEGER,
            timestamp TEXT,
            FOREIGN KEY (weather_station_id) REFERENCES weather_stations(id),
            FOREIGN KEY (variable_id) REFERENCES variables(id)
        )
    `
  ).run();
} catch (e) {
  console.error("Failed to migrate. Error: ", e);
}

console.info("Successfully migrated database.");
