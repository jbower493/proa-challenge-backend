import { WeatherStation } from "@/models/WeatherStation";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const numberId = Number(id);

  if (isNaN(numberId)) {
    return Response.json(
      { error: "Please provide a valid id." },
      { status: 400 }
    );
  }

  const stationDetails = WeatherStation.findById(numberId);

  if (!stationDetails) {
    return Response.json(
      { error: "Please provide the id of an existing weather station." },
      { status: 400 }
    );
  }

  const latestMeasurements =
    WeatherStation.getLatestMeasurementsForEachStationVariable(numberId);

  const stationWithMeasurements = {
    ...stationDetails,
    latest_measurements: latestMeasurements,
  };

  return Response.json({ data: stationWithMeasurements });
}
