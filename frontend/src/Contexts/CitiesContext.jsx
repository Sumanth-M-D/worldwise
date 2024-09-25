import { useCallback } from "react";
import { useContext, createContext, useEffect, useReducer } from "react";

const BASE_URL = "http://localhost:3000";

const CitiesContext = createContext();

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        isLoading: true,
      };

    case "cities/loaded":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
      };

    case "city/loaded":
      return {
        ...state,
        currentCity: action.payload,
        isLoading: false,
      };

    case "city/created":
      return {
        ...state,
        cities: [...state.cities, action.payload],
        isLoading: false,
        currentCity: action.payload,
      };

    case "city/deleted":
      return {
        ...state,
        cities: state.cities.filter((city) => city.id !== action.payload),
        isLoading: false,
        currentCity: {},
      };

    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      throw new Error("Unknown action type");
  }
}

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  //.
  //? Fetching all the cities from API server
  useEffect(function () {
    async function fetchCities() {
      try {
        dispatch({ type: "loading" });
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        console.log(data);
        dispatch({ type: "cities/loaded", payload: data });
      } catch (err) {
        dispatch({ type: "rejected", payload: "Error fetching the cities." });
      }
    }
    fetchCities();
  }, []);

  //.
  //? Fetching the city from API server
  const getCity = useCallback(
    async function getCity(id) {
      if (Number(id) === currentCity.id) return;

      try {
        dispatch({ type: "loading" });
        const res = await fetch(`${BASE_URL}/cities/${id}`);
        const data = await res.json();
        dispatch({ type: "city/loaded", payload: data });
      } catch (err) {
        dispatch({ type: "rejected", payload: "Error getting the city." });
      }
    },
    [currentCity.id]
  );

  //.
  //? Creating a new city
  async function createCity(city) {
    try {
      dispatch({ type: "loading" });
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(city),
        headers: {
          "Content-type": "application/json",
        },
      });
      const data = await res.json();

      dispatch({ type: "city/created", payload: data });
    } catch (err) {
      dispatch({ type: "rejected", payload: "Error creating a city." });
    }
  }

  //.
  //? Deleting a city
  async function deleteCity(id) {
    try {
      dispatch({ type: "loading" });
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });

      dispatch({ type: "city/deleted", payload: id });
    } catch (err) {
      dispatch({ type: "rejected", payload: "Error deleting the city." });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (!context)
    throw new Error("CitiesContext was used outside the context provider ");

  return context;
}

export { CitiesProvider, useCities };
