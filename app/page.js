"use client";

import { useEffect, useState } from “react”;
import { createClient } from “@supabase/supabase-js”;

const supabase = createClient(
“https://klmjyeljhfozthxocjit.supabase.co”,
“sb_publishable_omCeokV2Z1-LIBvDRVOQuQ_Y6htlTvl”
);

const VIP_LEVELS = [
{
id: 1,
name: “SVIP 1”,
price: 100000000,
multiplier: “2x”,
features: [
“🌈 Renkli kullanıcı adı”,
“💰 Oyun kazançlarında 2x çarpan”,
“📢 Üstten kayan bildirim”,
“☑️ Onaylı kullanıcı rozeti”,
],
},
{
id: 2,
name: “SVIP 2”,
price: 150000000,
multiplier: “5x”,
features: [
“🌈 Özel renkli kullanıcı adı”,
“💎 Oyun kazançlarında 5x çarpan”,
“☑️ Onaylı kullanıcı rozeti”,
],
},
];

const ACHIEVEMENTS = [
{
id: “lucky”,
name: “Şanslı Oyuncu”,
icon: “🍀”,
description: “Jackpot kazan.”,
},
{
id: “generous”,
name: “Cömert”,
icon: “🎁”,
description: “Toplam 2.000.000 coin hediye et.”,
},
{
id: “rich”,
name: “Para Babası”,
icon: “💰”,
description: “Toplam 10.000.000 coin kazan.”,
},
{
id: “jackpot”,
name: “Jackpot Ustası”,
icon: “🎰”,
description: “5 kez Jackpot kazan.”,
},
{
id: “legend”,
name: “Efsane Oyuncu”,
icon: “🏆”,
description: “100 oyun tamamla.”,
},
{
id: “vip”,
name: “VIP Koleksiyoncusu”,
icon: “👑”,
description: “Bir VIP seviyesi satın al.”,
},
];

const panelStyle = {
background: “#151522”,
border: “1px solid #303047”,
borderRadius: 16,
padding: 20,
margin: “18px auto”,
maxWidth: 700,
};

const buttonStyle = {
background: “linear-gradient(135deg, #f5c542, #e69b16)”,
color: “#111”,
border: “none”,
borderRadius: 10,
padding: “12px 18px”,
fontWeight: “bold”,
cursor: “pointer”,
};

export default function Home() {
const [page, setPage] = useState(“home”);
const [coins, setCoins] = useState(1000);
const [vip, setVip] = useState(0);
const [totalEarned, setTotalEarned] = useState(0);
const [gamesPlayed, setGamesPlayed] = useState(0);
const [jackpotWins, setJackpotWins] = useState(0);
const [giftedCoins, setGiftedCoins] = useState(0);
const [notice, setNotice] = useState(””);

const [email, setEmail] = useState(””);
const [password, setPassword] = useState(””);
const [newPassword, setNewPassword] = useState(””);
const [recoveryMode, setRecoveryMode] = useState(false);
const [user, setUser] = useState(null);
const [authBusy, setAuthBusy] = useState(false);

// Mega Slot değişkenleri
const [slotSymbols, setSlotSymbols] = useState([“🍒”, “🍋”, “💎”]);
const [slotSpinning, setSlotSpinning] = useState(false);
const [slotMessage, setSlotMessage] = useState(””);

// Kayıtlı oyun verilerini yükle
useEffect(() => {
try {
const saved = localStorage.getItem(“boss-game-data”);

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

// Oyun verilerini sakla
useEffect(() => {
try {
const data = {
coins,
vip,
totalEarned,
gamesPlayed,
jackpotWins,
giftedCoins,
};

  localStorage.setItem("boss-game-data", JSON.stringify(data));
} catch {
  // Tarayıcı depolaması kullanılamazsa oyun çalışmaya devam eder.
}

}, [coins, vip, totalEarned, gamesPlayed, jackpotWins, giftedCoins]);

// Kullanıcı oturumu ve şifre kurtarma
useEffect(() => {
let mounted = true;

supabase.auth.getSession().then(({ data, error }) => {
  if (!mounted) return;
  if (error) {
    setNotice(error.message);
    return;
  }
  setUser(data.session?.user ?? null);
});
const { data: listener } = supabase.auth.onAuthStateChange(
  (event, session) => {
    if (!mounted) return;
    setUser(session?.user ?? null);
    if (event === "PASSWORD_RECOVERY") {
      setRecoveryMode(true);
      setPage("login");
      setNotice("Yeni şifreni belirleyebilirsin.");
    }
  }
);
return () => {
  mounted = false;
  listener.subscription.unsubscribe();
};

}, []);

const notify = (message) => {
setNotice(message);
};

// Kayıt ol ve giriş yap
const handleAuth = async (mode) => {
if (!email.trim() || !password) {
notify(“Lütfen e-posta ve şifreni gir.”);
return;
}

setAuthBusy(true);
setNotice("");
try {
  const result =
    mode === "signup"
      ? await supabase.auth.signUp({
          email: email.trim(),
          password,
        })
      : await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
  if (result.error) throw result.error;
  if (mode === "signup" && !result.data.session) {
    notify("Kayıt oluşturuldu! E-posta adresini doğrula.");
  } else {
    setUser(result.data.user ?? null);
    notify("İşlem başarılı!");
  }
} catch (error) {
  notify(error.message || "Bir hata oluştu.");
} finally {
  setAuthBusy(false);
}

};

// Şifre sıfırlama bağlantısı gönder
const resetPassword = async () => {
if (!email.trim()) {
notify(“Lütfen e-posta adresini gir.”);
return;
}

setAuthBusy(true);
setNotice("");
try {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo: window.location.origin,
    }
  );
  if (error) throw error;
  notify("Şifre sıfırlama bağlantısı e-posta adresine gönderildi.");
} catch (error) {
  notify(error.message || "Şifre sıfırlama bağlantısı gönderilemedi.");
} finally {
  setAuthBusy(false);
}

};

// Yeni şifre kaydet
const updatePassword = async () => {
if (newPassword.length < 6) {
notify(“Yeni şifren en az 6 karakter olmalı.”);
return;
}

setAuthBusy(true);
setNotice("");
try {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  setPassword("");
  setNewPassword("");
  setRecoveryMode(false);
  notify("Şifren başarıyla değiştirildi!");
} catch (error) {
  notify(error.message || "Şifre değiştirilemedi.");
} finally {
  setAuthBusy(false);
}

};

// Oturumu kapat
const signOut = async () => {
const { error } = await supabase.auth.signOut();
setNotice(error ? error.message : “Çıkış yapıldı.”);
};

// VIP satın alma
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

// Mega Slot oyunu
const playSlot = () => {
if (slotSpinning) return;

if (coins < 100) {
  notify("Çevirmek için en az 100 coin gerekiyor!");
  return;
}
setCoins((current) => current - 100);
setSlotSpinning(true);
setSlotMessage("");
const symbols = ["🍒", "🍋", "🍇", "💎", "7️⃣"];
setTimeout(() => {
  const result = Array.from(
    { length: 3 },
    () => symbols[Math.floor(Math.random() * symbols.length)]
  );
  setSlotSymbols(result);
  if (result.every((symbol) => symbol === "7️⃣")) {
    setCoins((current) => current + 5000);
    setTotalEarned((current) => current + 5000);
    setJackpotWins((current) => current + 1);
    setSlotMessage("🎉 JACKPOT! +5.000 COIN!");
  } else if (result.every((symbol) => symbol === result[0])) {
    setCoins((current) => current + 1000);
    setTotalEarned((current) => current + 1000);
    setSlotMessage("💎 MEGA KAZANÇ! +1.000 COIN!");
  } else if (
    result[0] === result[1] ||
    result[1] === result[2]
  ) {
    setCoins((current) => current + 200);
    setTotalEarned((current) => current + 200);
    setSlotMessage("✨ KAZANDIN! +200 COIN!");
  } else {
    setSlotMessage("🍀 Bu sefer olmadı. Tekrar dene!");
  }
  setGamesPlayed((current) => current + 1);
  setSlotSpinning(false);
}, 1200);

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
minHeight: “100vh”,
background: “radial-gradient(ellipse at top, #24203a 0%, #09090f 55%)”,
color: “white”,
fontFamily: “Arial, sans-serif”,
padding: “22px 14px”,
textAlign: “center”,
boxSizing: “border-box”,
}}
>
<h1
style={{
color: “#f5c542”,
fontSize: “clamp(32px, 7vw, 48px)”,
textShadow: “0 0 22px #f5c54255”,
marginBottom: 8,
}}
>
👑 BOSS GAME
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
          background: page === id ? "#f5c542" : "#222233",
          color: page === id ? "#111" : "white",
          border:
            page === id ? "1px solid #f5c542" : "1px solid #3b3b50",
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
        <button style={buttonStyle} onClick={() => setPage("slot")}>
          🎰 Mega Slot Oyna
        </button>
        <button style={buttonStyle} onClick={() => setPage("vip")}>
          👑 VIP Seviyelerini Gör
        </button>
        <button
          style={{ ...buttonStyle, background: "#34344c", color: "white" }}
          onClick={() => setPage("badges")}
        >
          🏆 Başarılarım
        </button>
      </div>
    </section>
  )}
  {page === "slot" && (
    <section
      style={{
        ...panelStyle,
        maxWidth: 500,
        background: "linear-gradient(180deg, #241333, #09090f)",
        border: "2px solid #f5c542",
        boxShadow: "0 0 30px #f5c54233",
      }}
    >
      <h2 style={{ color: "#f5c542", fontSize: 30 }}>👑 MEGA SLOT</h2>
      <p style={{ color: "#ddd" }}>Çevirme başına 100 coin</p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          margin: "28px 0",
          padding: 18,
          background: "#09090f",
          border: "2px solid #a855f7",
          borderRadius: 16,
        }}
      >
        {slotSymbols.map((symbol, index) => (
          <div
            key={index}
            style={{
              width: 85,
              height: 95,
              display: "grid",
              placeItems: "center",
              background: "#fff",
              borderRadius: 12,
              fontSize: 48,
              boxShadow: "inset 0 0 12px #f5c542",
            }}
          >
            {symbol}
          </div>
        ))}
      </div>
      <div style={{ color: "#f5c542", fontSize: 20, margin: 16 }}>
        🪙 Bakiye: {coins.toLocaleString("tr-TR")}
      </div>
      <button
        style={{
          ...buttonStyle,
          width: "100%",
          fontSize: 20,
          padding: 16,
          opacity: slotSpinning || coins < 100 ? 0.5 : 1,
        }}
        disabled={slotSpinning || coins < 100}
        onClick={playSlot}
      >
        {slotSpinning ? "🎰 ÇEVRİLİYOR..." : "🎰 100 COIN İLE ÇEVİR"}
      </button>
      {slotMessage && (
        <div
          role="status"
          style={{
            marginTop: 20,
            color: "#f5c542",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          {slotMessage}
        </div>
      )}
      <p style={{ color: "#aaa", fontSize: 12, marginTop: 20 }}>
        Demo oyunudur. Coinler oyun içi puanlardır; gerçek para değeri yoktur.
      </p>
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
                borderColor: level.id === 2 ? "#a855f7" : "#f5c542",
                boxShadow:
                  level.id === 2 ? "0 0 22px #a855f722" : "0 0 22px #f5c54211",
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
              <div style={{ fontSize: 21, fontWeight: "bold", margin: "18px 0" }}>
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
                {owned ? "✓ Sahipsin" : "VIP Satın Al"}
              </button>
            </article>
          );
        })}
      </div>
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
              <div style={{ fontSize: 42 }}>{achievement.icon}</div>
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
  {page === "rooms" && (
    <section style={panelStyle}>
      <h2>🎙️ Sesli Sohbet</h2>
      <p>Sesli oda ve mikrofon sistemi henüz bağlanmadı.</p>
    </section>
  )}
  {page === "login" && (
    <section style={panelStyle}>
      <h2 style={{ color: "#f5c542" }}>👑 BOSS GAME ÜYELİK</h2>
      {user ? (
        <>
          <h3 style={{ color: "#5be39a" }}>✓ Başarıyla giriş yaptın!</h3>
          <p>Hesabın: {user.email}</p>
          <button style={buttonStyle} onClick={signOut}>
            Çıkış Yap
          </button>
        </>
      ) : recoveryMode ? (
        <>
          <p>Yeni şifreni belirle.</p>
          <input
            type="password"
            placeholder="Yeni şifre (en az 6 karakter)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
              border: "1px solid #555",
            }}
          />
          <button
            style={buttonStyle}
            disabled={authBusy}
            onClick={updatePassword}
          >
            {authBusy ? "Bekle..." : "Yeni Şifreyi Kaydet"}
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
              border: "1px solid #555",
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
              border: "1px solid #555",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 18,
            }}
          >
            <button
              style={buttonStyle}
              disabled={authBusy}
              onClick={() => handleAuth("signup")}
            >
              {authBusy ? "Bekle..." : "📝 Kayıt Ol"}
            </button>
            <button
              style={{ ...buttonStyle, background: "#34344c", color: "white" }}
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
              cursor: "pointer",
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
