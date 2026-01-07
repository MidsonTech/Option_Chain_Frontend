"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const wsRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [data, setData] = useState(null);

  // Input state
  const [symbol, setSymbol] = useState("NIFTY");
  const [strike, setStrike] = useState(25400);
  const [expiry, setExpiry] = useState("2026-01-27");
  const [spotRange, setSpotRange] = useState(
    "25700,25750,25800,25850,25900"
  );

  const connectWS = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(
      "wss://option-chain-en8e.onrender.com/ws/option-chain/live-vix"
    );

    ws.onopen = () => {
      setConnected(true);

      ws.send(
        JSON.stringify({
          symbol,
          strike: Number(strike),
          expiry,
          spot_range: spotRange.split(",").map(Number),
          vix_range: []
        })
      );
    };

    ws.onmessage = (event) => {
      setData(JSON.parse(event.data)); // overwrite → latest only
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = () => {
      setConnected(false);
    };

    wsRef.current = ws;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-6 text-zinc-100">
  {/* HEADER */}
  <header className="mb-8 flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Midson Option Chain Platform
      </h1>
      <p className="text-sm text-zinc-400">
        Live VIX-Driven Option Pricing Engine
      </p>
    </div>

    <span className="rounded-full bg-emerald-500/10 px-4 py-1 text-sm text-emerald-400">
      Live
    </span>
  </header>

  {/* INPUT CARD */}
  <section className="mb-8 rounded-2xl border border-white/10 bg-zinc-900/70 p-6 backdrop-blur">
    <h2 className="mb-4 text-lg font-semibold text-zinc-200">
      Strategy Inputs
    </h2>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <input
        className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm outline-none focus:border-emerald-500"
        placeholder="Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />

      <input
        className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm outline-none focus:border-emerald-500"
        placeholder="Strike"
        type="number"
        value={strike}
        onChange={(e) => setStrike(e.target.value)}
      />

      <input
        className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm outline-none focus:border-emerald-500"
        type="date"
        value={expiry}
        onChange={(e) => setExpiry(e.target.value)}
      />

      <input
        className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm outline-none focus:border-emerald-500"
        placeholder="Spot range (comma separated)"
        value={spotRange}
        onChange={(e) => setSpotRange(e.target.value)}
      />
    </div>

    <button
      onClick={connectWS}
      className="mt-6 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
    >
      {connected ? "Reconnect Feed" : "Connect Live Feed"}
    </button>
  </section>

  {/* META INFO */}
  {data && (
    <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
      {[
        ["Symbol", data.symbol],
        ["Strike", data.strike],
        ["Expiry", data.expiry],
        ["DTE", data.days_to_expiry],
        ["VIX", data.vix]
      ].map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl border border-white/10 bg-zinc-900/70 p-4 text-center"
        >
          <div className="text-xs text-zinc-400">{label}</div>
          <div className="mt-1 text-lg font-semibold">{value}</div>
        </div>
      ))}
    </section>
  )}

  {/* OPTION CHAIN TABLE */}
  {data && (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-black/60 text-zinc-300">
          <tr>
            <th className="px-4 py-3 text-left">Spot</th>
            <th className="px-4 py-3 text-right">Call</th>
            <th className="px-4 py-3 text-right">Put</th>
            <th className="px-4 py-3 text-right">Δ Call</th>
            <th className="px-4 py-3 text-right">Δ Put</th>
          </tr>
        </thead>

        <tbody>
          {data.prices.map((row, idx) => (
            <tr
              key={idx}
              className="border-t border-white/5 hover:bg-white/5 transition"
            >
              <td className="px-4 py-2">{row.spot}</td>
              <td className="px-4 py-2 text-right text-emerald-400">
                {row.call}
              </td>
              <td className="px-4 py-2 text-right text-rose-400">
                {row.put}
              </td>
              <td className="px-4 py-2 text-right">
                {row.delta_call}
              </td>
              <td className="px-4 py-2 text-right">
                {row.delta_put}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )}
</main>

  );
}
