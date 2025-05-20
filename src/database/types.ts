export type TWeatherStation = {
  id: number;
  name: string;
  site: string;
  portfolio: string;
  state: string;
  latitude: number;
  longitude: number;
};

export type TWeatherVariable = {
  id: number;
  weather_station_id: TWeatherStation["id"];
  name: string;
  unit: string;
  long_name: string;
};

export type TMeasurement = {
  id: number;
  variable_id: TWeatherVariable["id"];
  weather_station_id: TWeatherStation["id"];
  value: number;
  timestamp: string;
};
