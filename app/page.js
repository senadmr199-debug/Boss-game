"use client";

import { useState } from "react";

export default function Home() {
  const [page, setPage] = useState("home");

  return (
    <main style={{
      minHeight: "100vh",
      background: "#09090f",
      color: "white",
      fontFamily: "Arial, sans-serif",
      padding: 20,
      textAlign: "center"
    }}>
      <h1 style={{color: "#f5c542", fontSize: 42}}>
        👑 BOSS GAME
      </h1>

      <p>Oyunun patronu sensin!</p>

      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 10,
        flexWrap: "wrap",
        margin: "25px 0"
      }}>
        <button onClick={() => setPage("home")}>Ana Sayfa</button>
        <button onClick={() => setPage("slot")}>🎰 Slot</button>
        <button onClick={() => setPage("rooms")}>🎙️ Sesli Odalar</button>
        <button onClick={() => setPage("login")}>👤 Giriş</button>
      </div>

      {page === "home" && (
        <section>
          <h2>BOSS GAME'e Hoş Geldin</h2>
          <p>Oyna, puan kazan ve eğlen!</p>
          <p>🪙 Coin bakiyen: 1000</p>
        </section>
      )}

      {page === "slot" && (
        <section>
          <h2>🎰 Slot Oyunu</h2>
          <p>Slot oyunu sonraki aşamada eklenecek.</p>
        </section>
      )}

      {page === "rooms" && (
        <section>
          <h2>🎙️ Sesli Sohbet</h2>
          <p>Sesli odaları sonraki aşamada bağlayacağız.</p>
        </section>
      )}

      {page === "login" && (
        <section>
          <h2>👤 Üyelik</h2>
          <p>Kayıt ve giriş sistemi sonraki aşamada bağlanacak.</p>
        </section>
      )}

      <footer style={{marginTop: 60, color: "#999"}}>
        BOSS GAME © 2026
      </footer>
    </main>
  );
}
