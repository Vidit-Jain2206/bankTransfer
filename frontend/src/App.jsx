import { useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [from_bank, setFrom_Bank] = useState();
  const [to_bank, setTo_bank] = useState();

  const [res, setRes] = useState();
  const handleOnClick = async (e) => {
    e.preventDefault();

    const { data } = await axios.get(
      `http://localhost:8080/api/v1/options?from_bank=${from_bank}&to_bank=${to_bank}`
    );
    setRes(data.data);
  };
  return (
    <>
      <input
        type="text"
        placeholder="Enter From Bank Account"
        onChange={(e) => {
          setTo_bank(e.target.value);
        }}
      />
      <input
        type="text"
        placeholder="Enter To Bank Account"
        onChange={(e) => {
          setFrom_Bank(e.target.value);
        }}
      />

      <button onClick={handleOnClick}>Get options</button>
      {res && (
        <div>
          Min Time: {res.min_time}, Min Cost: {res.min_cost}
        </div>
      )}
    </>
  );
}

export default App;
