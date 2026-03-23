const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 3000;
const API_KEY = "26ef5347ec0e452392ef217536dc87cf";

// EMA
function calculateEMA(prices, period) {
  let k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

// RSI
function calculateRSI(prices, period = 14) {
  let gains = 0, losses = 0;

  for (let i = 1; i <= period; i++) {
    let diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let rs = gains / losses || 1;
  return 100 - (100 / (1 + rs));
}

// ⚡ CACHE SYSTEM (FAST)
let lastSignal = null;
let lastTime = 0;

// SIGNAL API
app.get("/signal", async (req, res) => {
  try {
    const now = Date.now();

    if (now - lastTime < 5000 && lastSignal) {
      return res.json(lastSignal);
    }

    const symbol = req.query.symbol || "EUR/USD";

    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1min&apikey=${API_KEY}`;

    const response = await axios.get(url);
    const data = response.data.values;

    const closes = data.map(c => parseFloat(c.close)).reverse();

    const ema = calculateEMA(closes, 10);
    const rsi = calculateRSI(closes, 14);
    const price = closes[closes.length - 1];

    let signal = "WAIT";

    // 🔥 IMPROVED LOGIC (LESS WAIT + SMART)
    if (rsi < 40) signal = "UP 📈";
    else if (rsi > 60) signal = "DOWN 📉";

    if (price > ema && rsi < 50) signal = "UP 📈";
    if (price < ema && rsi > 50) signal = "DOWN 📉";

    lastSignal = { signal, rsi, ema, price };
    lastTime = now;

    res.json(lastSignal);

  } catch (err) {
    res.json({ error: "API error" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
