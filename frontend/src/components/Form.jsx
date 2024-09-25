// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from "react";
import styles from "./Form.module.css";
import "react-datepicker/dist/react-datepicker.css";
import Button from "./Button";
import BackButton from "./BackButton";
import { useUrlPosition } from "../hooks/useUrlPosition";
import Flag from "./Flag";
import Message from "./Message";
import Spinner from "./Spinner";
import DatePicker from "react-datepicker";
import { useCities } from "../Contexts/CitiesContext";
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

function Form() {
  const [lat, lng] = useUrlPosition();

  const [isLoadingGeocodeData, setisLoadingGeocodeData] = useState(false);
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date());
  const [emoji, setEmoji] = useState("");
  const [geocodingError, setGeocodingError] = useState("");
  const { createCity, isLoading } = useCities();
  const navigate = useNavigate(); // Initialize useNavigate

  //? Fetching the geocoding data of the city
  useEffect(
    function () {
      if (!lat && !lng) return;

      async function fetchCityData() {
        try {
          setisLoadingGeocodeData(true);
          setGeocodingError("");
          const res = await fetch(
            `${BASE_URL}?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();

          if (!data.countryCode)
            throw new Error(
              "That doesn't seem to be a city. Click somewhere else. 🙃"
            );

          setCityName(data.cityName || data.locality || "");
          setCountry(data.countryName);
          setEmoji(convertToEmoji(data.countryCode || ""));
        } catch (err) {
          console.log(err);
          setGeocodingError(err.message);
        } finally {
          setisLoadingGeocodeData(false);
        }
      }

      fetchCityData();
    },
    [lat, lng]
  );

  async function handleSubmit(e) {
    e.preventDefault();

    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      date,
      emoji,
      notes,
      position: { lat, lng },
    };
    await createCity(newCity);

    navigate("/app/cities"); // navigate back to cities
  }

  if (isLoadingGeocodeData) return <Spinner />;

  if (!lat && !lng)
    return <Message message={"Start by clicking somewhere on the map"} />;

  if (geocodingError) return <Message message={geocodingError} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>
          <Flag flag={emoji} />
          {/* {emoji} */}
        </span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        {/* <input
          id="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
        /> */}
        <DatePicker
          selected={date}
          onChange={(date) => setDate(date)}
          dateFormat={"dd/MM/yyy"}
          id="date"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
