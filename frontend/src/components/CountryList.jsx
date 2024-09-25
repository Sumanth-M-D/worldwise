import styles from "./CountryList.module.css";
import Spinner from "./Spinner";
import CountryItem from "./CountryItem";
import Message from "./Message";
import { useCities } from "../Contexts/CitiesContext";

function CountryList() {
  const { cities, isLoading } = useCities();

  if (isLoading) return <Spinner />;

  if (cities.length === 0)
    return (
      <Message
        message={"Add Your first city by clicking on a city on the map"}
      />
    );

  const countries = [
    ...new Map(
      cities.map((city) => [
        city.country,
        { country: city.country, emoji: city.emoji },
      ])
    ).values(),
  ];

  return (
    <ul className={styles.countryList}>
      {countries.map((country) => (
        <CountryItem country={country} key={country.country} />
      ))}
    </ul>
  );
}

export default CountryList;
