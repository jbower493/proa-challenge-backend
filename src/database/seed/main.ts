import { db } from "../connection";
import fs from "node:fs";
import os from "node:os";
import { WeatherVariable } from "../types";

function readCsv(path: string): { headings: string[]; rows: string[][] } {
  const file = fs.readFileSync(path, { encoding: "utf-8" });

  const [headings, ...rows] = file
    .split(os.EOL)
    // Filter out the last line which is blank
    .filter((line) => line);

  return {
    headings: headings.split(","),
    rows: rows.map((row) => row.split(",")),
  };
}

function insertWeatherStations() {
  const weatherStations = readCsv("proa_sample_data/weather_stations.csv");

  weatherStations.rows.forEach((row) => {
    const [id, name, site, portfolio, state, latitude, longitude] = row;

    db.prepare(
      `
            INSERT INTO weather_stations (id, name, site, portfolio, state, latitude, longitude) VALUES (?,?,?,?,?,?,?)
        `
    ).run(
      Number(id),
      name,
      site,
      portfolio,
      state,
      Number(latitude),
      Number(longitude)
    );
  });

  console.info("Successfully inserted weather stations.");
}

function insertVariables() {
  const variables = readCsv("proa_sample_data/variables.csv");

  variables.rows.forEach((row) => {
    const [id, weatherStationId, name, unit, longName] = row;

    db.prepare(
      `
            INSERT INTO weather_variables (id, weather_station_id, name, unit, long_name) VALUES (?,?,?,?,?)
        `
    ).run(Number(id), Number(weatherStationId), name, unit, longName);
  });

  console.info("Successfully inserted variables.");
}

function insertMeasurements() {
  const dir = fs.readdirSync("proa_sample_data");
  const dataFiles = dir.filter((fileName) => fileName.startsWith("data_"));

  const weatherVariables = db
    .prepare(`SELECT id, name, weather_station_id FROM weather_variables`)
    .all() as WeatherVariable[];

  dataFiles.forEach((dataFile) => {
    const { headings: fileHeadings, rows: fileRows } = readCsv(
      `proa_sample_data/${dataFile}`
    );

    const weatherStationId = Number(dataFile.match(/\d+/)?.[0]);

    // Don't assume timestamp is always in the last column, find its index to be safe
    const timestampIndex = fileHeadings.findIndex(
      (heading) => heading === "timestamp"
    );

    fileHeadings.forEach((variableName, headingIndex) => {
      if (headingIndex === timestampIndex) {
        return;
      }

      fileRows.forEach((row) => {
        const variableValue = row[headingIndex];
        const timestamp = row[timestampIndex];

        // Validate that the measurement is a valid variables from the correct weather station before inserting
        const matchingVariable = weatherVariables.find(
          (variableFromDb) =>
            variableFromDb.weather_station_id === weatherStationId &&
            variableFromDb.name === variableName
        );

        if (matchingVariable) {
          db.prepare(
            `
                INSERT INTO measurements (weather_station_id, variable_id, value, timestamp) VALUES (?,?,?,?)
            `
          ).run(
            weatherStationId,
            matchingVariable.id,
            variableValue,
            timestamp
          );
        }
      });
    });
  });

  console.info("Successfully inserted measurements.");
}

try {
  insertWeatherStations();
  insertVariables();
  insertMeasurements();
} catch (e) {
  console.error("Failed to seed DB. Error: ", e);
}
