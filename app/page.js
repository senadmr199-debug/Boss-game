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
    description: "Jackpot kazan.",
  },
  {
    id: "generous",
    name: "Cömert",
    icon: "🎁",
    description: "Toplam 2.000.000 coin hediye et.",
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
    description: "Bir VIP seviyesi satın al.",
  },
];

const SYMBOLS = ["🍒", "🍋", "🍇", "💎", "7️⃣", "👑"];

const panelStyle = {
  background: "#151522",
  border: "1px solid #303047",
  borderRadius: 16,
  padding: 20,
  margin: "18px auto",
  maxWidth: 700,
  boxSizing: "border-box",
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

const inputStyle = {
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
};

const formatCoins = (value) =>
  Math.floor(value).toLocaleString("tr-TR");

export default function Home() {
  const [page, setPage] = useState("home");

  const [coins, setCoins] = useState(1000);
  const [vip, setVip] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [jackpotWins, setJackpotWins] = useState(0);
  const [giftedCoins, setGiftedCoins] = useState(0);

  const [notice, setNotice] = useState("");
  const [gameDataLoaded, setGameDataLoaded] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [user, setUser] = useState(null);
  const [authBusy, setAuthBusy] = useState(false);

  // SLOT 2.0
  const [slotSymbols, setSlotSymbols] = useState([
    "🍒",
    "👑",
    "💎",
  ]);

  const [slotSpinning, setSlotSpinning] = useState(false);
  const [slotMessage, setSlotMessage] = useState("");
  const [slotBet, setSlotBet] = useState(100);
  const [customBet, setCustomBet] = useState("100");

  const [fastSpin, setFastSpin] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [autoSpinCount, setAutoSpinCount] = useState(10);
  const [autoRemaining, setAutoRemaining] = useState(0);

  const [slotHistory, setSlotHistory] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [slotEffect, setSlotEffect] = useState(false);

  // Kayıtlı oyun verilerini yükle
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
        setSlotHistory(
          Array.isArray(data.slotHistory)
            ? data.slotHistory.slice(0, 10)
            : []
        );
      }
    } catch {
      setNotice("Kayıtlı oyun verileri okunamadı.");
    } finally {
      setGameDataLoaded(true);
    }
  }, []);

  // Verileri yükledikten sonra kaydet
  useEffect(() => {
    if (!gameDataLoaded) return;

    try {
      localStorage.setItem(
        "boss-game-data",
        JSON.stringify({
          coins,
          vip,
          totalEarned,
          gamesPlayed,
          jackpotWins,
          giftedCoins,
          slotHistory,
        })
      );
    } catch {
      // Depolama kapalıysa oyun çalışmaya devam eder.
    }
  }, [
    gameDataLoaded,
    coins,
    vip,
    totalEarned,
    gamesPlayed,
    jackpotWins,
    giftedCoins,
    slotHistory,
  ]);

  // Supabase oturumu
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

    const { data: listener } =
      supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;

        setUser(session?.user ?? null);

        if (event === "PASSWORD_RECOVERY") {
          setRecoveryMode(true);
          setPage("login");
          setNotice("Yeni şifreni belirleyebilirsin.");
        }
      });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const notify = (message) => {
    setNotice(message);
  };

  // Ses efekti
  const playSound = (type) => {
    if (!soundEnabled || typeof window === "undefined") return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      const audio = new AudioContextClass();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();

      oscillator.connect(gain);
      gain.connect(audio.destination);

      oscillator.type = "sine";

      oscillator.frequency.value =
        type === "win" ? 880 : type === "jackpot" ? 1200 : 330;

      gain.gain.setValueAtTime(0.12, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audio.currentTime + 0.25
      );

      oscillator.start();
      oscillator.stop(audio.currentTime + 0.25);

      oscillator.onended = () => {
        audio.close().catch(() => {});
      };
    } catch {
      // Ses desteklenmiyorsa oyun çalışmaya devam eder.
    }
  };

  // Kayıt ol ve giriş yap
  const handleAuth = async (mode) => {
    if (!email.trim() || !password) {
      notify("Lütfen e-posta ve şifreni gir.");
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

  // Şifre sıfırlama
  const resetPassword = async () => {
    if (!email.trim()) {
      notify("Lütfen e-posta adresini gir.");
      return;
    }

    setAuthBusy(true);
    setNotice("");

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: window.location.origin,
          }
        );

      if (error) throw error;

      notify(
        "Şifre sıfırlama bağlantısı e-posta adresine gönderildi."
      );
    } catch (error) {
      notify(
        error.message ||
          "Şifre sıfırlama bağlantısı gönderilemedi."
      );
    } finally {
      setAuthBusy(false);
    }
  };

  // Yeni şifre kaydet
  const updatePassword = async () => {
    if (newPassword.length < 6) {
      notify("Yeni şifren en az 6 karakter olmalı.");
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

    setNotice(error ? error.message : "Çıkış yapıldı.");

    if (!error) setUser(null);
  };

  // VIP satın alma
  const buyVip = (level) => {
    const selected = VIP_LEVELS.find(
      (item) => item.id === level
    );

    if (!selected) return;

    if (vip >= level) {
      notify("Bu VIP seviyesine zaten sahipsin!");
      return;
    }

    if (coins < selected.price) {
      notify(
        `Yetersiz coin! ${formatCoins(selected.price)} coin gerekiyor.`
      );
      return;
    }

    setCoins((current) => current - selected.price);
    setVip(level);

    notify(`${selected.name} başarıyla satın alındı! 👑`);
  };

  // Bahis miktarını belirle
  const selectBet = (amount) => {
    if (slotSpinning || autoSpin) return;

    setSlotBet(amount);
    setCustomBet(String(amount));
    setSlotMessage("");
  };

  const applyCustomBet = () => {
    if (slotSpinning || autoSpin) return;

    const amount = Number(customBet);

    if (
      !Number.isSafeInteger(amount) ||
      amount < 100 ||
      amount > 1000000
    ) {
      notify("Bahis 100 ile 1.000.000 coin arasında olmalı.");
      return;
    }

    setSlotBet(amount);
    setCustomBet(String(amount));
    setSlotMessage("");
    notify(`Bahis ${formatCoins(amount)} coin olarak ayarlandı.`);
  };

  // Ödül hesaplama
  const calculateSlotPrize = (result, bet) => {
    if (result.every((symbol) => symbol === "👑")) {
      return {
        base: bet * 100,
        label: "👑 KRAL JACKPOT!",
        type: "jackpot",
        jackpot: true,
      };
    }

    if (result.every((symbol) => symbol === "7️⃣")) {
      return {
        base: bet * 50,
        label: "🎰 777 JACKPOT!",
        type: "jackpot",
        jackpot: true,
      };
    }

    if (result.every((symbol) => symbol === result[0])) {
      return {
        base: bet * 10,
        label: "💎 ÜÇ AYNI! MEGA KAZANÇ!",
        type: "win",
        jackpot: false,
      };
    }

    if (
      result[0] === result[1] ||
      result[1] === result[2] ||
      result[0] === result[2]
    ) {
      return {
        base: bet * 2,
        label: "✨ İKİ AYNI! KAZANDIN!",
        type: "win",
        jackpot: false,
      };
    }

    return {
      base: 0,
      label: "🍀 Bu sefer olmadı. Tekrar dene!",
      type: "lose",
      jackpot: false,
    };
  };

  // Tek slot turu
  const playSlot = () => {
    if (slotSpinning) return;

    if (!Number.isSafeInteger(slotBet) || slotBet < 100) {
      notify("Geçerli bir bahis miktarı seç.");
      setAutoSpin(false);
      return;
    }

    if (coins < slotBet) {
      notify("Bahis için yeterli coin yok!");
      setAutoSpin(false);
      return;
    }

    setCoins((current) => current - slotBet);
    setSlotSpinning(true);
    setSlotMessage("");
    setSlotEffect(false);
    setNotice("");

    playSound("spin");

    const duration = fastSpin ? 350 : 1200;

    setTimeout(() => {
      const result = Array.from(
        { length: 3 },
        () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      );

      const prize = calculateSlotPrize(result, slotBet);

      const vipMultiplier =
        vip >= 2 ? 5 : vip === 1 ? 2 : 1;

      const payout = Math.floor(prize.base * vipMultiplier);

      setSlotSymbols(result);

      if (payout > 0) {
        setCoins((current) => current + payout);
        setTotalEarned((current) => current + payout);
        setSlotEffect(true);

        setSlotMessage(
          `${prize.label} +${formatCoins(payout)} COIN` +
            (vipMultiplier > 1
              ? ` (VIP ${vipMultiplier}x dahil)`
              : "")
        );

        playSound(prize.jackpot ? "jackpot" : "win");
      } else {
        setSlotMessage(prize.label);
        playSound("lose");
      }

      if (prize.jackpot) {
        setJackpotWins((current) => current + 1);
      }

      setGamesPlayed((current) => current + 1);

      const historyItem = {
        id: `${Date.now()}-${Math.random()}`,
        symbols: result,
        bet: slotBet,
        payout,
        label: prize.label,
        time: new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setSlotHistory((current) =>
        [historyItem, ...current].slice(0, 10)
      );

      setSlotSpinning(false);

      if (autoSpin) {
        setAutoRemaining((current) => {
          const next = Math.max(0, current - 1);

          if (next === 0 || coins < slotBet) {
            setAutoSpin(false);
          }

          return next;
        });
      }
    }, duration);
  };

  // Otomatik çevirme
  useEffect(() => {
    if (!autoSpin || slotSpinning || autoRemaining <= 0) return;

    const timer = setTimeout(() => {
      playSlot();
    }, 250);

    return () => clearTimeout(timer);
  }, [autoSpin, slotSpinning, autoRemaining]);

  const startAutoSpin = () => {
    if (slotSpinning || autoSpin) return;

    if (coins < slotBet) {
      notify("Otomatik çevirmeye başlamak için yeterli coin yok!");
      return;
    }

    setAutoRemaining(autoSpinCount);
    setAutoSpin(true);
    setSlotMessage("");
    notify(`${autoSpinCount} turluk otomatik çevirme başladı.`);
  };

  const stopAutoSpin = () => {
    setAutoSpin(false);
    setAutoRemaining(0);
    notify("Otomatik çevirme durduruldu.");
  };

  const achievements = {
    lucky: jackpotWins > 0,
    generous: giftedCoins >= 2000000,
    rich: totalEarned >= 10000000,
    jackpot: jackpotWins >= 5,
    legend: gamesPlayed >= 100,
    vip: vip >= 1,
  };

  const activeVip = VIP_LEVELS.find(
    (item) => item.id === vip
  );

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
      <style>{`
        @keyframes royalGlow {
          0%, 100% { box-shadow: 0 0 15px #f5c54233; }
          50% { box-shadow: 0 0 35px #f5c542aa; }
        }
        @keyframes royalWin {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .royal-slot-symbol {
          animation: royalGlow 1.5s infinite;
        }
        .royal-slot-win {
          animation: royalWin 0.6s ease-in-out 2;
        }
        .royal-control {
          min-height: 44px;
        }
        @media (prefers-reduced-motion: reduce) {
          .royal-slot-symbol,
          .royal-slot-win {
            animation: none;
          }
        }
      `}</style>

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

      <p style={{ color: "#c9c6d8" }}>
        Oyunun patronu sensin!
      </p>

      <div style={panelStyle}>
        <div style={{ fontSize: 14, color: "#aaa" }}>
          COIN BAKİYEN
        </div>

        <div
          style={{
            color: "#f5c542",
            fontSize: 30,
            fontWeight: "bold",
            margin: "8px 0",
          }}
        >
          🪙 {formatCoins(coins)}
        </div>

        <div style={{ color: "#c9c6d8" }}>
          {activeVip
            ? `Aktif üyeliğin: ${activeVip.name}`
            : "Standart Üye"}
        </div>
      </div>

      {/* ANA MENÜ */}
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
            className="royal-control"
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

      {/* ANA SAYFA */}
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
              className="royal-control"
              style={buttonStyle}
              onClick={() => setPage("slot")}
            >
              🎰 Mega Slot Oyna
            </button>

            <button
              className="royal-control"
              style={buttonStyle}
              onClick={() => setPage("vip")}
            >
              👑 VIP Seviyelerini Gör
            </button>

            <button
              className="royal-control"
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

      {/* SLOT 2.0 */}
      {page === "slot" && (
        <section
          style={{
            ...panelStyle,
            maxWidth: 540,
            background:
              "linear-gradient(180deg, #241333, #09090f)",
            border: "2px solid #f5c542",
            boxShadow: "0 0 30px #f5c54233",
          }}
        >
          <h2
            style={{
              color: "#f5c542",
              fontSize: "clamp(26px, 6vw, 34px)",
              marginTop: 4,
            }}
          >
            👑 ROYAL MEGA SLOT
          </h2>

          <p style={{ color: "#ddd" }}>
            Bahsini seç, makaraları çevir ve ödülünü kazan!
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              margin: "24px 0",
              padding: 14,
              background: "#09090f",
              border: "2px solid #a855f7",
              borderRadius: 16,
            }}
          >
            {slotSymbols.map((symbol, index) => (
              <div
                key={index}
                className={
                  slotEffect && !slotSpinning
                    ? "royal-slot-win"
                    : "royal-slot-symbol"
                }
                style={{
                  flex: "1 1 0",
                  minWidth: 0,
                  maxWidth: 100,
                  height: "clamp(75px, 19vw, 100px)",
                  display: "grid",
                  placeItems: "center",
                  background:
                    "linear-gradient(180deg, #fff, #ded8f5)",
                  borderRadius: 12,
                  fontSize: "clamp(30px, 8vw, 48px)",
                  boxShadow: "inset 0 0 12px #f5c542",
                }}
              >
                {slotSpinning ? "🎰" : symbol}
              </div>
            ))}
          </div>

          <div
            style={{
              color: "#f5c542",
              fontSize: 22,
              fontWeight: "bold",
              margin: 16,
            }}
          >
            🪙 Bakiye: {formatCoins(coins)}
          </div>

          {/* BAHİS SEÇİMİ */}
          <h3 style={{ color: "#ddd" }}>💰 Bahis miktarı</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: 8,
              margin: "12px 0",
            }}
          >
            {[100, 250, 500, 1000].map((amount) => (
              <button
                key={amount}
                className="royal-control"
                disabled={slotSpinning || autoSpin}
                onClick={() => selectBet(amount)}
                style={{
                  ...buttonStyle,
                  background:
                    slotBet === amount ? "#f5c542" : "#29243a",
                  color: slotBet === amount ? "#111" : "white",
                  border:
                    slotBet === amount
                      ? "2px solid #fff0a0"
                      : "1px solid #555",
                }}
              >
                🪙 {formatCoins(amount)}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              margin: "14px 0",
            }}
          >
            <input
              aria-label="Özel bahis miktarı"
              type="number"
              min="100"
              max="1000000"
              step="1"
              value={customBet}
              disabled={slotSpinning || autoSpin}
              onChange={(event) =>
                setCustomBet(event.target.value)
              }
              style={{
                ...inputStyle,
                width: 190,
                margin: 0,
              }}
            />

            <button
              className="royal-control"
              disabled={slotSpinning || autoSpin}
              onClick={applyCustomBet}
              style={buttonStyle}
            >
              Bahsi Uygula
            </button>
          </div>

          <p style={{ color: "#ddd" }}>
            Seçili bahis:{" "}
            <strong style={{ color: "#f5c542" }}>
              {formatCoins(slotBet)} coin
            </strong>
          </p>

          {/* HIZLI MOD VE SES */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              flexWrap: "wrap",
              margin: "18px 0",
            }}
          >
            <button
              className="royal-control"
              onClick={() => setFastSpin((current) => !current)}
              style={{
                ...buttonStyle,
                background: fastSpin ? "#16a34a" : "#34344c",
                color: "white",
              }}
            >
              {fastSpin ? "⚡ Hızlı Mod: Açık" : "⚡ Hızlı Mod: Kapalı"}
            </button>

            <button
              className="royal-control"
              onClick={() => setSoundEnabled((current) => !current)}
              style={{
                ...buttonStyle,
                background: soundEnabled ? "#16a34a" : "#34344c",
                color: "white",
              }}
            >
              {soundEnabled ? "🔊 Ses Açık" : "🔇 Ses Kapalı"}
            </button>
          </div>

          {/* TEK TUR */}
          <button
            className="royal-control"
            style={{
              ...buttonStyle,
              width: "100%",
              fontSize: 20,
              padding: 16,
              opacity:
                slotSpinning || autoSpin || coins < slotBet
                  ? 0.5
                  : 1,
            }}
            disabled={
              slotSpinning || autoSpin || coins < slotBet
            }
            onClick={playSlot}
          >
            {slotSpinning
              ? "🎰 ÇEVRİLİYOR..."
              : `🎰 ${formatCoins(slotBet)} COIN İLE ÇEVİR`}
          </button>

          {/* OTOMATİK TUR */}
          <h3 style={{ color: "#f5c542", marginTop: 26 }}>
            🔄 Otomatik Çevirme
          </h3>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              flexWrap: "wrap",
              margin: "12px 0",
            }}
          >
            {[10, 25, 50].map((count) => (
              <button
                key={count}
                className="royal-control"
                disabled={slotSpinning || autoSpin}
                onClick={() => setAutoSpinCount(count)}
                style={{
                  ...buttonStyle,
                  background:
                    autoSpinCount === count
                      ? "#f5c542"
                      : "#34344c",
                  color:
                    autoSpinCount === count ? "#111" : "white",
                }}
              >
                {count} Tur
              </button>
            ))}
          </div>

          {!autoSpin ? (
            <button
              className="royal-control"
              style={{
                ...buttonStyle,
                width: "100%",
                background: "#7c3aed",
                color: "white",
                marginTop: 8,
              }}
              disabled={slotSpinning || coins < slotBet}
              onClick={startAutoSpin}
            >
              ▶️ {autoSpinCount} Turu Başlat
            </button>
          ) : (
            <button
              className="royal-control"
              style={{
                ...buttonStyle,
                width: "100%",
                background: "#dc2626",
                color: "white",
                marginTop: 8,
              }}
              onClick={stopAutoSpin}
            >
              ⏹️ Otomatik Oyunu Durdur
            </button>
          )}

          {autoSpin && (
            <p style={{ color: "#c4b5fd" }}>
              Kalan tur: {autoRemaining}
            </p>
          )}

          {/* KAZANÇ MESAJI */}
          {slotMessage && (
            <div
              role="status"
              className={
                slotEffect ? "royal-slot-win" : ""
              }
              style={{
                marginTop: 22,
                padding: 16,
                borderRadius: 12,
                background: "#171326",
                border: "1px solid #f5c542",
                color: "#f5c542",
                fontSize: "clamp(16px, 4vw, 20px)",
                fontWeight: "bold",
                overflowWrap: "anywhere",
              }}
            >
              {slotMessage}
            </div>
          )}

          {/* ÖDÜL TABLOSU */}
          <div
            style={{
              marginTop: 24,
              padding: 14,
              borderRadius: 12,
              background: "#11101b",
              textAlign: "left",
              color: "#ddd",
              fontSize: 14,
            }}
          >
            <h3 style={{ color: "#f5c542", textAlign: "center" }}>
              🏆 Ödül Tablosu
            </h3>

            <p>👑 👑 👑 — Bahsin 100 katı</p>
            <p>7️⃣ 7️⃣ 7️⃣ — Bahsin 50 katı</p>
            <p>💎 Üç aynı sembol — Bahsin 10 katı</p>
            <p>✨ İki aynı sembol — Bahsin 2 katı</p>

            <p style={{ color: "#aaa", fontSize: 12 }}>
              Ödüller VIP çarpanı uygulanmadan önce hesaplanır.
            </p>
          </div>

          {/* OYUN GEÇMİŞİ */}
          <div
            style={{
              marginTop: 24,
              textAlign: "left",
              background: "#11101b",
              padding: 14,
              borderRadius: 12,
            }}
          >
            <h3 style={{ color: "#f5c542", textAlign: "center" }}>
              📜 Son 10 Oyun
            </h3>

            {slotHistory.length === 0 ? (
              <p style={{ color: "#aaa", textAlign: "center" }}>
                Henüz oyun geçmişin yok.
              </p>
            ) : (
              <div>
                {slotHistory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 0",
                      borderBottom: "1px solid #303047",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 20 }}>
                        {item.symbols.join(" ")}
                      </div>

                      <div style={{ color: "#999" }}>
                        {item.time} · Bahis {formatCoins(item.bet)}
                      </div>

                      <div style={{ color: "#c9c6d8" }}>
                        {item.label}
                      </div>
                    </div>

                    <strong
                      style={{
                        color:
                          item.payout > 0 ? "#5be39a" : "#ff7777",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.payout > 0
                        ? `+${formatCoins(item.payout)}`
                        : "0"}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p
            style={{
              color: "#aaa",
              fontSize: 12,
              marginTop: 20,
            }}
          >
            Demo oyunudur. Coinler oyun içi puanlardır;
            gerçek para değeri yoktur.
          </p>
        </section>
      )}

      {/* VIP MARKET */}
      {page === "vip" && (
        <section>
          <h2 style={{ color: "#f5c542" }}>
            👑 VIP MARKET
          </h2>

          <p>Coinlerinle VIP seviyeni yükselt.</p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
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
                      color:
                        level.id === 2
                          ? "#d8a7ff"
                          : "#f5c542",
                    }}
                  >
                    {level.id === 1 ? "💎" : "👑"}{" "}
                    {level.name}
                  </h3>

                  <div
                    style={{
                      fontSize: 21,
                      fontWeight: "bold",
                      margin: "18px 0",
                    }}
                  >
                    🪙 {formatCoins(level.price)}
                  </div>

                  {level.features.map((feature) => (
                    <p key={feature} style={{ color: "#ddd" }}>
                      {feature}
                    </p>
                  ))}

                  <button
                    className="royal-control"
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

      {/* BAŞARI ROZETLERİ */}
      {page === "badges" && (
        <section>
          <h2 style={{ color: "#f5c542" }}>
            🏆 BAŞARI ROZETLERİ
          </h2>

          <p>Görevleri tamamla, rozetlerini topla!</p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
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
                    borderColor: unlocked
                      ? "#f5c542"
                      : "#303047",
                  }}
                >
                  <div style={{ fontSize: 42 }}>
                    {achievement.icon}
                  </div>

                  <h3
                    style={{
                      color: unlocked ? "#f5c542" : "white",
                    }}
                  >
                    {achievement.name}
                  </h3>

                  <p
                    style={{
                      color: "#c9c6d8",
                      fontSize: 14,
                    }}
                  >
                    {achievement.description}
                  </p>

                  <strong
                    style={{
                      color: unlocked ? "#5be39a" : "#999",
                    }}
                  >
                    {unlocked ? "✓ Açıldı" : "🔒 Kilitli"}
                  </strong>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* SESLİ ODALAR */}
      {page === "rooms" && (
        <section style={panelStyle}>
          <h2>🎙️ Sesli Sohbet</h2>
          <p>Sesli oda ve mikrofon sistemi henüz bağlanmadı.</p>
        </section>
      )}

      {/* ÜYELİK VE GİRİŞ */}
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
                className="royal-control"
                style={buttonStyle}
                onClick={signOut}
              >
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
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                style={inputStyle}
              />

              <button
                className="royal-control"
                style={buttonStyle}
                disabled={authBusy}
                onClick={updatePassword}
              >
                {authBusy ? "Bekle..." : "Yeni Şifreyi Kaydet"}
              </button>
            </>
          ) : (
            <>
              <p>
                Hesabına giriş yap veya yeni hesap oluştur.
              </p>

              <input
                type="email"
                placeholder="E-posta adresin"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="Şifren (en az 6 karakter)"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                style={inputStyle}
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
                  className="royal-control"
                  style={buttonStyle}
                  disabled={authBusy}
                  onClick={() => handleAuth("signup")}
                >
                  {authBusy ? "Bekle..." : "📝 Kayıt Ol"}
                </button>

                <button
                  className="royal-control"
                  style={{
                    ...buttonStyle,
                    background: "#34344c",
                    color: "white",
                  }}
                  disabled={authBusy}
                  onClick={() => handleAuth("login")}
                >
                  🔑 Giriş Yap
                </button>
              </div>

              <button
                className="royal-control"
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
          Coin ve oyun geçmişi bu tarayıcıda saklanır.
        </p>
      </footer>
    </main>
  );
}
