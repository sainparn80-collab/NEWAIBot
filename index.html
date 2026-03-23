<!DOCTYPE html>
<html>
<head>
  <title>AI Signal Bot PRO</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    body {
      font-family: Arial;
      background: #020617;
      color: white;
      text-align: center;
    }

    iframe {
      width: 100%;
      height: 260px;
      border-radius: 10px;
      border: none;
    }

    select, button {
      padding: 12px;
      margin: 6px;
      width: 90%;
      border-radius: 10px;
      border: none;
      font-size: 16px;
    }

    button {
      background: linear-gradient(45deg,#4f46e5,#9333ea);
      color: white;
    }

    .win { background: #16a34a; }
    .loss { background: #dc2626; }

    .signal {
      font-size: 26px;
      margin: 10px;
    }

    .card {
      background: #0f172a;
      padding: 10px;
      border-radius: 10px;
      margin: 10px;
    }
  </style>
</head>

<body>

<h1>MASTER QUOTEX SIGNAL 🚀</h1>

<iframe id="chart"
src="https://s.tradingview.com/widgetembed/?symbol=FX:EURUSD&interval=1"></iframe>

<div class="card">

<select id="platform">
  <option>Quotex</option>
  <option>Pocket Option</option>
  <option>Binomo</option>
</select>

<select id="market">
  <option value="EUR/USD">EUR/USD</option>
  <option value="GBP/USD">GBP/USD</option>
  <option value="USD/JPY">USD/JPY</option>
  <option value="AUD/USD">AUD/USD</option>
  <option value="USD/CAD">USD/CAD</option>
  <option value="USD/CHF">USD/CHF</option>
  <option value="EUR/JPY">EUR/JPY</option>
  <option value="GBP/JPY">GBP/JPY</option>
  <option value="USD/BRL">USD/BRL (OTC)</option>
  <option value="USD/INR">USD/INR (OTC)</option>
  <option value="USD/PKR">USD/PKR (OTC)</option>
</select>

<select id="time">
  <option>5 sec</option>
  <option>10 sec</option>
  <option>15 sec</option>
  <option>30 sec</option>
  <option>1 min</option>
  <option>2 min</option>
  <option>5 min</option>
</select>

<button onclick="getSignal()">GET SIGNAL</button>

<div class="signal" id="signal">---</div>
<div id="extra"></div>

<h3>Stake: $<span id="stake">1</span></h3>

<button class="win" onclick="win()">WIN</button>
<button class="loss" onclick="loss()">LOSS</button>

</div>

<div class="card">
  <h3>📊 Stats</h3>
  Wins: <span id="wins">0</span> |
  Loss: <span id="losses">0</span><br>
  Win Rate: <span id="wr">0%</span>
</div>

<script>
let stake = 1;
let wins = 0;
let losses = 0;

// Chart update
document.getElementById("market").addEventListener("change", function() {
  let symbol = this.value.replace("/", "");
  document.getElementById("chart").src =
  "https://s.tradingview.com/widgetembed/?symbol=FX:" + symbol + "&interval=1";
});

// GET SIGNAL
function getSignal() {
  let market = document.getElementById("market").value;

  document.getElementById("signal").innerText = "Loading...";

  fetch("http://127.0.0.1:3000/signal?symbol=" + market)
  .then(res => res.json())
  .then(data => {
    document.getElementById("signal").innerText = data.signal;
    document.getElementById("extra").innerText =
      "RSI: " + data.rsi.toFixed(2) +
      " | Price: " + data.price.toFixed(5);
  })
  .catch(() => {
    alert("Backend connect nahi ho raha!");
  });
}

// Win
function win() {
  wins++;
  stake *= 2;
  update();
}

// Loss
function loss() {
  losses++;
  stake = 1;
  update();
}

function update() {
  document.getElementById("stake").innerText = stake;
  document.getElementById("wins").innerText = wins;
  document.getElementById("losses").innerText = losses;

  let total = wins + losses;
  let wr = total ? Math.round((wins / total) * 100) : 0;
  document.getElementById("wr").innerText = wr + "%";
}
</script>

</body>
</html>
