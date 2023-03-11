import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FlightCard from "../../components/FlightCard";

const Flights = () => {
  const [searchParams] = useSearchParams();
  const [flightData, setFlightData] = useState();

  const params = {};
  searchParams.forEach((val, key) => {
    params[key] = val;
  });

  useEffect(() => {
    let isSubscribed = true;
    const fetchData = async () => {
      const apiCall = await fetch(
        `http://localhost:3001/searchservice/api/v1/flights?date=${params.departuredate}&departureCityId=${params.departureCityId}&arrivalCityId=${params.arrivalCityId}`
      );
      const data = await apiCall.json();
      if (isSubscribed && data.success) {
        setFlightData(data.data);
      }
    };
    fetchData().catch((err) => console.error("wow:", err));

    return () => {
      isSubscribed = false;
    };
  }, [params.departuredate, params.departureCityId, params.arrivalCityId]);
  console.log(flightData);

  return (
    <div className="mt-14">
      {flightData?.Items?.map((item) => (
        <FlightCard key={item.id} {...item} />
      ))}

      {/* <FlightCard />
      <FlightCard />
      <FlightCard />
      <FlightCard /> */}
    </div>
  );
};

export default Flights;