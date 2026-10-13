"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://klmjyeljhfozthxocjit.supabase.co",
  "sb_publishable_omCeokV2Z1-LIBvDRVOQuQ_Y6htlTvl"
);
const VIP_LEVELS = [
  {
    id: 1,
    name: "SVIP 1",
    price: 100000000,
    multiplier: "2x",
    features: [
      "🌈 Renkli kullanıcı adı",
      "💰 Oyun kazançlarında 2x çarpan",
      "📢 Üstten kayan bildirim",
      "☑️ Onaylı kullanıcı rozeti",
    ],
  },
  {
    id: 2,
    name: "SVIP 2",
    price: 150000000,
    multiplier: "5x",
    features: [
      "🌈 Özel renkli kullanıcı adı",
      "💎 Oyun kazançlarında 5x çarpan",
      "☑️ Onaylı kullanıcı rozeti",
    ],
  },
];

const ACHIEVEMENTS = [
  {
    id: "lucky",
    name: "Şanslı Oyuncu",
    icon: "🍀",
    description: "Jackpot oyunundan 1.000.000 coin kazan.",
  },
  {
    id: "generous",
    name: "Cömert",
    icon: "🎁",
    description: "Diğer oyunculara toplam 2.000.000 coin hediye et.",
  },
  {
    id: "rich",
    name: "Para Babası",
    icon: "💰",
    description: "Toplam 10.000.000 coin kazan.",
  },
  {
    id: "jackpot",
    name: "Jackpot Ustası",
    icon: "🎰",
    description: "5 kez Jackpot kazan.",
  },
  {
    id: "legend",
    name: "Efsane Oyuncu",
    icon: "🏆",
    description: "100 oyun tamamla.",
  },
  {
    id: "vip",
    name: "VIP Koleksiyoncusu",
    icon: "👑",
    description: "SVIP seviyelerinden birini satın al.",
  },
];

const panelStyle = {
  background: "#151522",
  border: "1px solid #303047",
  borderRadius: 16,
  padding: 20,
  margin: "18px auto",
  maxWidth: 700,
};

const buttonStyle = {
  background: "linear-gradient(135deg, #f5c542, #e69b16)",
  color: "#111",
  border: "none",
  borderRadius: 10,
  padding: "12px 18px",
  fontWeight: "bold",
  cursor: "pointer",
};

export default function Home() {
  const [page, setPage] = useState("home");
  const [coins, setCoins] = useState(1000);
  const [vip, setVip] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [jackpotWins, setJackpotWins] = useState(0);
  const [giftedCoins, setGiftedCoins] = useState(0);
  const [notice, setNotice] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
const [newPassword, setNewPassword] = useState("");
const [user, setUser] = useState(null);
const [authBusy, setAuthBusy] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("boss-game-data");

      if (saved) {
        const data = JSON.parse(saved);

        setCoins(data.coins ?? 1000);
        setVip(data.vip ?? 0);
        setTotalEarned(data.totalEarned ?? 0);
        setGamesPlayed(data.gamesPlayed ?? 0);
        setJackpotWins(data.jackpotWins ?? 0);
        setGiftedCoins(data.giftedCoins ?? 0);
      }
    } catch {
      setNotice("Kayıtlı oyun verileri okunamadı.");
    }
  }, []);

  useEffect(() => {
    const data = {
      coins,
      vip,
      totalEarned,
      gamesPlayed,
      jackpotWins,
      giftedCoins,
    };

    localStorage.setItem("boss-game-data", JSON.stringify(data));
  }, [coins, vip, totalEarned, gamesPlayed, jackpotWins, giftedCoins]);
 useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setUser(data.session?.user ?? null);
  });

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
    }
  );

  return () => listener.subscription.unsubscribe();
}, []);

const handleAuth = async (mode) => {
  setAuthBusy(true);
  setNotice("");

  try {
    const result =
      mode === "signup"
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

    if (result.error) throw result.error;

    if (mode === "signup" && !result.data.session) {
      setNotice("Kayıt oluşturuldu! E-postanı doğrula.");
    } else {
      setUser(result.data.user ?? null);
      setNotice("İşlem başarılı!");
    }
  } catch (error) {
    setNotice(error.message || "Bir hata oluştu.");
  } finally {
    setAuthBusy(false);
  }
};

if (error) throw error;

setNotice("Şifre değiştirme bağlantısı e-posta adresine gönderildi. Gelen kutunu ve spam klasörünü kontrol et.");
  
    
    
  
    


  


const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  setNotice(error ? error.message : "Çıkış yapıldı.");
};
  const notify = (message) => {
    setNotice(message);
  };

  const buyVip = (level) => {
    const selected = VIP_LEVELS.find((item) => item.id === level);

    if (!selected) return;

    if (vip >= level) {
      notify("Bu VIP seviyesine zaten sahipsin!");
      return;
    }

    if (coins < selected.price) {
      notify(
        `Yetersiz coin! ${selected.price.toLocaleString("tr-TR")} coin gerekiyor.`
      );
      return;
    }

    setCoins((current) => current - selected.price);
    setVip(level);
    notify(`${selected.name} başarıyla satın alındı! 👑`);
  };

  const achievements = {
    lucky: jackpotWins > 0,
    generous: giftedCoins >= 2000000,
    rich: totalEarned >= 10000000,
    jackpot: jackpotWins >= 5,
    legend: gamesPlayed >= 100,
    vip: vip >= 1,
  };

  const activeVip = VIP_LEVELS.find((item) => item.id === vip);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at top, #24203a 0%, #09090f 55%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "22px 14px",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          color: "#f5c542",
          fontSize: "clamp(32px, 7vw, 48px)",
          textShadow: "0 0 22px #f5c54255",
          marginBottom: 8,
        }}
      >
        👑 BOSS GAME
      </h1>

      <p style={{ color: "#c9c6d8" }}>Oyunun patronu sensin!</p>

      <div style={panelStyle}>
        <div style={{ fontSize: 14, color: "#aaa" }}>COIN BAKİYEN</div>
        <div
          style={{
            color: "#f5c542",
            fontSize: 30,
            fontWeight: "bold",
            margin: "8px 0",
          }}
        >
          🪙 {coins.toLocaleString("tr-TR")}
        </div>

        <div style={{ color: "#c9c6d8" }}>
          {activeVip ? `Aktif üyeliğin: ${activeVip.name}` : "Standart Üye"}
        </div>
      </div>

      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          flexWrap: "wrap",
          margin: "24px auto",
          maxWidth: 800,
        }}
      >
        {[
          ["home", "🏠 Ana Sayfa"],
          ["slot", "🎰 Slot"],
          ["rooms", "🎙️ Sesli Odalar"],
          ["login", "👤 Giriş"],
          ["vip", "👑 VIP Market"],
          ["badges", "🏆 Rozetler"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => {
              setPage(id);
              setNotice("");
            }}
            style={{
              ...buttonStyle,
              background:
                page === id ? "#f5c542" : "#222233",
              color: page === id ? "#111" : "white",
              border:
                page === id
                  ? "1px solid #f5c542"
                  : "1px solid #3b3b50",
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {notice && (
        <div
          role="status"
          style={{
            ...panelStyle,
            color: "#f5c542",
            borderColor: "#f5c542",
          }}
        >
          {notice}
        </div>
      )}

      {page === "home" && (
        <section style={panelStyle}>
          <h2>✨ BOSS GAME&apos;e Hoş Geldin</h2>
          <p>Oyna, coin biriktir ve başarılarını aç!</p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 24,
            }}
          >
            <button
              style={buttonStyle}
              onClick={() => setPage("vip")}
            >
              👑 VIP Seviyelerini Gör
            </button>

            <button
              style={{
                ...buttonStyle,
                background: "#34344c",
                color: "white",
              }}
              onClick={() => setPage("badges")}
            >
              🏆 Başarılarım
            </button>
          </div>
        </section>
      )}

      {page === "vip" && (
        <section>
          <h2 style={{ color: "#f5c542" }}>👑 VIP MARKET</h2>
          <p>Coinlerinle VIP seviyeni yükselt.</p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 16,
              maxWidth: 800,
              margin: "20px auto",
            }}
          >
            {VIP_LEVELS.map((level) => {
              const owned = vip >= level.id;

              return (
                <article
                  key={level.id}
                  style={{
                    ...panelStyle,
                    width: "auto",
                    margin: 0,
                    borderColor:
                      level.id === 2 ? "#a855f7" : "#f5c542",
                    boxShadow:
                      level.id === 2
                        ? "0 0 22px #a855f722"
                        : "0 0 22px #f5c54211",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 28,
                      color: level.id === 2 ? "#d8a7ff" : "#f5c542",
                    }}
                  >
                    {level.id === 1 ? "💎" : "👑"} {level.name}
                  </h3>

                  <div
                    style={{
                      fontSize: 21,
                      fontWeight: "bold",
                      margin: "18px 0",
                    }}
                  >
                    🪙 {level.price.toLocaleString("tr-TR")}
                  </div>

                  {level.features.map((feature) => (
                    <p key={feature} style={{ color: "#ddd" }}>
                      {feature}
                    </p>
                  ))}

                  <button
                    style={{
                      ...buttonStyle,
                      width: "100%",
                      marginTop: 14,
                      opacity: owned ? 0.6 : 1,
                    }}
                    disabled={owned}
                    onClick={() => buyVip(level.id)}
                  >
                    {owned
                      ? "✓ Sahipsin"
                      : "VIP Satın Al"}
                  </button>
                </article>
              );
            })}
          </div>

          <p style={{ color: "#aaa", fontSize: 13 }}>
            VIP fiyatları oyun içi coin cinsindendir.
          </p>
        </section>
      )}

      {page === "badges" && (
        <section>
          <h2 style={{ color: "#f5c542" }}>🏆 BAŞARI ROZETLERİ</h2>
          <p>Görevleri tamamla, rozetlerini topla!</p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              maxWidth: 850,
              margin: "20px auto",
            }}
          >
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = achievements[achievement.id];

              return (
                <article
                  key={achievement.id}
                  style={{
                    ...panelStyle,
                    margin: 0,
                    opacity: unlocked ? 1 : 0.7,
                    borderColor: unlocked ? "#f5c542" : "#303047",
                  }}
                >
                  <div style={{ fontSize: 42 }}>
                    {achievement.icon}
                  </div>

                  <h3 style={{ color: unlocked ? "#f5c542" : "white" }}>
                    {achievement.name}
                  </h3>

                  <p style={{ color: "#c9c6d8", fontSize: 14 }}>
                    {achievement.description}
                  </p>

                  <strong style={{ color: unlocked ? "#5be39a" : "#999" }}>
                    {unlocked ? "✓ Açıldı" : "🔒 Kilitli"}
                  </strong>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {page === "slot" && (
        <section style={panelStyle}>
          <h2>🎰 Slot Oyunu</h2>
          <p>
            Slot oyununun gerçek oyun mekaniği henüz bu dosyada bulunmuyor.
          </p>
          <p style={{ color: "#f5c542" }}>
            Sonraki aşamada oyun sistemi bağlanabilir.
          </p>
        </section>
      )}

      {page === "rooms" && (
        <section style={panelStyle}>
          <h2>🎙️ Sesli Sohbet</h2>
          <p>Sesli oda ve mikrofon sistemi henüz bağlanmadı.</p>
        </section>
      )}

      {page === "login" && (
  <section style={panelStyle}>
    <h2 style={{ color: "#f5c542" }}>
      👑 BOSS GAME ÜYELİK
    </h2>

    {user ? (
      <>
        <h3 style={{ color: "#5be39a" }}>
          ✓ Başarıyla giriş yaptın!
        </h3>

        <p>Hesabın: {user.email}</p>

        <button
          style={buttonStyle}
          onClick={signOut}
        >
          Çıkış Yap
        </button>
      </>
    ) : (
      <>
        <p>Hesabına giriş yap veya yeni hesap oluştur.</p>

        <input
          type="email"
          placeholder="E-posta adresin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            maxWidth: 400,
            boxSizing: "border-box",
            margin: "12px auto",
            padding: 14,
            borderRadius: 8,
            background: "#222233",
            color: "white",
            border: "1px solid #555"
          }}
        />

        <input
          type="password"
          placeholder="Şifren (en az 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            maxWidth: 400,
            boxSizing: "border-box",
            margin: "12px auto",
            padding: 14,
            borderRadius: 8,
            background: "#222233",
            color: "white",
            border: "1px solid #555"
          }}
        />

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          flexWrap: "wrap",
          marginTop: 18
        }}>
          <button
            style={buttonStyle}
            disabled={authBusy}
            onClick={() => handleAuth("signup")}
          >
            {authBusy ? "Bekle..." : "📝 Kayıt Ol"}
          </button>

          <button
            style={{
              ...buttonStyle,
              background: "#34344c",
              color: "white"
            }}
            disabled={authBusy}
            onClick={() => handleAuth("login")}
          >
            🔑 Giriş Yap
          </button>
        </div>

        <button
          disabled={authBusy}
          onClick={resetPassword}
          style={{
            background: "transparent",
            color: "#f5c542",
            border: "none",
            padding: 16,
            cursor: "pointer"
          }}
        >
          Şifremi Unuttum
        </button>
      </>
    )}
  </section>
)}
      
          
          
        
          
          
        
  

      <footer
        style={{
          marginTop: 55,
          padding: 20,
          color: "#777",
          borderTop: "1px solid #242432",
        }}
      >
        BOSS GAME © 2026
        <p style={{ fontSize: 12 }}>
          Oyun içi coinler demo sürümünde tarayıcıda saklanır.
        </p>
      </footer>
    </main>
  );
}
