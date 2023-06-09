import React, { useEffect, useState } from "react";
import Button from "../common/Button";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDuration, getTimeIST } from "../util/helper";
import BookingModal from "../pages/BookingPage/BookingModal";
import { useContext } from "react";
import UserContext from "../context/userContext";
import ErrorModal from "../util/ErrorModal";
import SuccessModal from "../util/SuccessModal";
import LoadingModal from "../util/LoadingModal";

const FlightDetailsCard = () => {
  const [flightData, setFlightData] = useState();
  const [counter, setCounter] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [isSuccessVisible, setSuccessVisible] = useState(false);
  const [errorFound, setErrorFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { id } = useParams();
  const fetchFlightData = async () => {
    const apiCall = await fetch(`${process.env.REACT_APP_SEARCH_API_URL}/flights/${id}`);
    return await apiCall.json();
  };
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);

  const { data, isLoading, isError } = useQuery(["flights", id], fetchFlightData, {
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data?.success) {
      setFlightData(data.data);
    }
  }, [data, id, errorFound]);

  let departureTime, arrivalTime, duration;
  if (flightData) {
    // const {flightNumber}
    duration = getDuration(flightData.departureTime, flightData.arrivalTime);
    arrivalTime = getTimeIST(flightData.arrivalTime);
    departureTime = getTimeIST(flightData.departureTime);
  }
  const incrementSeats = () => {
    if (counter < 9) {
      setCounter((prev) => prev + 1);
    }
  };
  const decrementSeats = () => {
    if (counter > 1) {
      setCounter((prev) => prev - 1);
    }
  };
  const handleBookingModal = async () => {
    if (!currentUser) {
      setErrorMsg("Please Sign in before booking a flight");
      setErrorFound((prev) => !prev);
    } else if (currentUser.status !== "Active") {
      setErrorMsg("Please confirm your email address");
      setErrorFound((prev) => !prev);
    } else {
      setIsVisible((prev) => !prev);
    }
  };

  if (isLoading) {
    return <LoadingModal isLoading={isLoading} />;
  }
  if (isError) {
    setErrorFound(true);
  }
  let date, totalCost;
  if (flightData) {
    const data = new Date(flightData?.arrivalTime).toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
    date = data.split(",");
    date = `${date[0]}${date[1]}`;
    totalCost = flightData.price * counter;
  }
  return (
    <div className="mt-24 lg:mx-36 xl:mx-56 2xl:mx-64">
      <div className=" h-90 min-h-[50%] bg-white shadow-lg rounded-xl md:h-90 lg:h-96 ">
        <div className="flex justify-between  font-semibold mt-2 px-4 py-4 lg:p-8">
          <div className="hidden lg:w-20 md:block "></div>
          <div className="text-md md:text-2xl lg:text-3xl"> {`Indigo ${flightData?.flightNumber}`}</div>
          <div className="text-xs lg:text-base">{`${duration}`}</div>
        </div>
        {/* <div className="flex justify-center text-3xl font-semibold mt-2 p-8"></div> */}
        <hr />
        <div className="flex  justify-between  py-4 px-4 md:p-8">
          <p className="lg:text-xl"> {departureTime} </p>
          <div className="text-2xl">{"✈️"}</div>
          <p className="lg:text-xl"> {arrivalTime} </p>
        </div>
        <div className="flex items-center justify-between  text-[12px] pb-4 px-4 lg:px-8">
          <p className="break-words w-1/4">{flightData?.departureAirport}</p>
          <p className="break-words w-1/4 text-right">{flightData?.arrivalAirport}</p>
        </div>
        <hr />
        <div className="flex justify-between items-center text-base px-2 md:px-4 lg:px-8 mt-2 pb-5 md:pt-4 lg:pt-4 lg:pb-4 ">
          <div className=" text-sm md:text-xl">Economy</div>
          <div className="flex flex-col justify-center ">
            <div className="text-sm md:text-base">No. of Seats: </div>
            <div className="flex justify-between  text-xl md:text-2xl items-center mt-2 cursor-pointer selection:bg-none">
              <span className="p-2 shadow-md rounded-lg" onClick={decrementSeats}>
                {"<"}{" "}
              </span>
              <span className="text-lg">{counter}</span>
              <span className="p-2 shadow-md rounded-lg" onClick={incrementSeats}>
                {">"}{" "}
              </span>
            </div>
          </div>
          <div className="text-sm md:text-2xl font-semibold">{`INR ₹${flightData?.price}/-`}</div>
        </div>
      </div>
      <div className="flex justify-center mt-4 gap-4">
        <Button
          title={"Cancel"}
          customStyle={"bg-white text-primarypurple py-4 px-5 font-semibold lg:font-semibold"}
          onClick={() => navigate(-1)}
        />
        <Button
          title={"Select"}
          customStyle={"p-4 px-6 bg-primarypurple text-slate-100"}
          onClick={handleBookingModal}
        />
      </div>
      {isVisible && (
        <BookingModal
          show={isVisible}
          setShow={setIsVisible}
          // {...bookingData}
          noOfSeats={counter}
          totalCost={totalCost}
          {...currentUser}
          duration={duration}
          arrivaltime={arrivalTime}
          departuretime={departureTime}
          date={date}
          flightId={flightData?.id}
          arrivalCity={flightData?.arrivalCity}
          departureCity={flightData?.departureCity}
          setSuccessVisible={setSuccessVisible}
        />
      )}
      {errorFound && <ErrorModal show={errorFound} setShow={setErrorFound} Message={errorMsg} />}
      {isSuccessVisible && <SuccessModal show={isSuccessVisible} setShow={setSuccessVisible} />}
    </div>
  );
};

export default FlightDetailsCard;
