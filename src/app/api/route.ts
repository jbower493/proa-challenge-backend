import { WeatherStation } from "@/models/WeatherStation";

export function GET() {
  const allStations = WeatherStation.all().map(
    ({ id, name, site, portfolio, state, latitude, longitude }) => ({
      id,
      // Rename "name" to "ws_name" as per task requirements.
      ws_name: name,
      site,
      portfolio,
      state,
      latitude,
      longitude,
    })
  );

  return Response.json({ data: allStations });
}
