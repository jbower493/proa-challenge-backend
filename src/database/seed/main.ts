import { db } from "../connection";
import fs from "node:fs";
import os from "node:os";

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
      id,
      name,
      site,
      portfolio,
      state,
      Number(latitude),
      Number(longitude)
    );
  });

  const stations = db.prepare("select * from weather_stations").all();

  console.log(stations);
}

try {
  insertWeatherStations();
} catch (e) {
  console.error("Failed to seed DB. Error: ", e);
}
