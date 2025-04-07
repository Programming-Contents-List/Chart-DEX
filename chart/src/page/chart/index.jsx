import React, { useState, useEffect, useRef } from "react";
import Dashboard from "../../components/dashbord";
import { formatData } from "../../utils";
import "../../styles/styles.css";

export default function Chart() {
  const [currencies, setcurrencies] = useState([]);
  const [pair, setpair] = useState("");
  const [price, setprice] = useState("0.00");
  const [pastData, setpastData] = useState({});
  const ws = useRef(null);

  let first = useRef(false);

  const url = "https://api.exchange.coinbase.com";
  const wsUrl = "wss://ws-feed.exchange.coinbase.com";

  useEffect(() => {
    ws.current = new WebSocket(wsUrl);

    const apiCall = async () => {
      try {
        const res = await fetch(`${url}/products`);
        const data = await res.json();
        let pairs = Array.isArray(data) ? data : [];

        let filtered = pairs
          .filter((pair) => pair.quote_currency === "USD")
          .sort((a, b) => {
            if (a.base_currency < b.base_currency) return -1;
            if (a.base_currency > b.base_currency) return 1;
            return 0;
          });

        setcurrencies(filtered);
        first.current = true;

        if (filtered.length > 0) setpair(filtered[0].id);
      } catch (err) {
        console.error("API fetch error:", err);
      }
    };

    apiCall();
  }, []);

  useEffect(() => {
    if (!first.current || !pair) return;

    const subscribeToPair = () => {
      const msg = {
        type: "subscribe",
        product_ids: [pair],
        channels: ["ticker"],
      };
      const jsonMsg = JSON.stringify(msg);

      if (ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(jsonMsg);
      } else {
        ws.current.addEventListener("open", () => {
          ws.current.send(jsonMsg);
        });
      }
    };

    subscribeToPair();

    const historicalDataURL = `${url}/products/${pair}/candles?granularity=86400`;

    const fetchHistoricalData = async () => {
      try {
        const res = await fetch(historicalDataURL);
        const data = await res.json();
        const formattedData = formatData(data);
        setpastData(formattedData);
      } catch (err) {
        console.error("Historical fetch error:", err);
      }
    };

    fetchHistoricalData();

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type !== "ticker") return;
      if (data.product_id === pair) setprice(data.price);
    };
  }, [pair]);

  const handleSelect = (e) => {
    const unsubMsg = {
      type: "unsubscribe",
      product_ids: [pair],
      channels: ["ticker"],
    };

    const sendUnsub = () => {
      ws.current.send(JSON.stringify(unsubMsg));
    };

    if (ws.current.readyState === WebSocket.OPEN) {
      sendUnsub();
    } else {
      ws.current.addEventListener("open", sendUnsub);
    }

    setpair(e.target.value);
  };

  return (
    <div className="container">
      <select name="currency" value={pair} onChange={handleSelect}>
        {currencies.map((cur, idx) => (
          <option key={idx} value={cur.id}>
            {cur.display_name || `${cur.base_currency}-${cur.quote_currency}`}
          </option>
        ))}
      </select>
      <Dashboard price={price} data={pastData} />
    </div>
  );
}
