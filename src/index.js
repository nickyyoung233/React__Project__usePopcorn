import React from "react";
import ReactDOM from "react-dom/client"; //React18+
import "./index.css";
import App from "./App";
// import StarRating from "./StarRating";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating maxRating={7} defaultRating={1} />
    <StarRating
      size={24}
      color="red"
      maxRating={3}
      className="test"
      message={["Not good", "Well", "Amazing"]}
    /> */}
  </React.StrictMode>
);
