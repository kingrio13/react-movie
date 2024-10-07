// import React, { useState } from "react";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import Geo from "./Geo";
// import StarRating from "./StarRating";
// import TextChallenge from "./TextChallenge";

const root = ReactDOM.createRoot(document.getElementById("root"));

// function Test() {
//   const [movieRating, setMovieRating] = useState();

//   return (
//     <>
//       <StarRating
//         maxRating={9}
//         defaultRating={8}
//         color="blue"
//         onsetRating={setMovieRating}
//       />
//       <p>This Movie Was Rated {movieRating} stars</p>
//     </>
//   );
// }

root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating maxRating={9} defaultRating={8} color="red" /> */}
    {/* <Test /> */}
    {/* <TextChallenge /> */}
    {/* <Geo /> */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
