import styles from "./CountryItem.module.css";
import Flag from "./Flag";

function CountryItem({ country }) {
  return (
    <li className={styles.countryItem}>
      <span>
        <Flag flag={country.emoji} />
      </span>
      <span>{country.country}</span>
    </li>
  );
}

export default CountryItem;
