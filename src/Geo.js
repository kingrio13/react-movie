import { useGeo } from "./useGeo";
import { useState } from "react";

export default function App() {
  const { isLoading, position, error, getPosition } = useGeo();
  const [countClicks, setCountClicks] = useState(0);
  const { lat, lng } = position;

  function clickHandler() {
    setCountClicks((count) => count + 1);
    getPosition();
  }
  return (
    <div>
      <button onClick={clickHandler} disabled={isLoading}>
        Get my position
      </button>

      {isLoading && <p>Loading position...</p>}
      {error && <p>{error}</p>}
      {!isLoading && !error && lat && lng && (
        <p>
          Your GPS position:{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://www.openstreetmap.org/#map=16/${lat}/${lng}`}
          >
            {lat}, {lng}
          </a>
        </p>
      )}

      <p>You requested position {countClicks} times</p>
    </div>
  );
}
