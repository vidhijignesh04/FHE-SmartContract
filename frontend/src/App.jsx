import { useEffect, useState } from "react";
import axios from "axios";

function App() {

  const [title, setTitle] = useState("");
  const [markets, setMarkets] = useState([]);


  const fetchMarkets = async () => {
    try {

      const response = await axios.get(
        "http://localhost:5000/markets"
      );

      setMarkets(response.data);

    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    fetchMarkets();
  }, []);


  const createMarket = async () => {

    try {

      await axios.post(
        "http://localhost:5000/markets",
        {
          title
        }
      );

      setTitle("");

      fetchMarkets();

    } catch (error) {
      console.log(error);
    }

  };
  const buyShare = async (marketId, outcome) => {
  await axios.post(`http://localhost:5000/markets/${marketId}/buy`, {
    outcome
  });

  fetchMarkets();
};


  return (
    <div style={{ padding: "40px" }}>

      <h1>Prediction Market</h1>

      <input
        type="text"
        placeholder="Enter market title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button onClick={createMarket}>
        Create Market
      </button>

      <div>

        {
          markets.map((market) => (

            <div key={market.id}>

              <h2>{market.title}</h2>

              <p>
                YES: {market.yes_price}
              </p>

              <p>
                NO: {market.no_price}
              </p>

            </div>

          ))
        }

      </div>

    </div>
  );
}

export default App;