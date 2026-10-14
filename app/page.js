"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://klmjyeljhfozthxocjit.supabase.co",
  "sb_publishable_omCeokV2Z1-LIBvDRVOQuQ_Y6htlTvl"
);

const STORAGE_KEY = "boss-game-data";

const VIP_LEVELS = [
  {
    id: 1,
    name: "SVIP 1",
    price: 100000000,
    multiplier: 2,
    features: [
      "🌈 Renkli kullanıcı adı",
      "💰 2x oyun kazancı",
      "📢 Özel bildirim",
      "☑️ Onaylı kullanıcı rozeti",
    ],
  },
  {
    id: 2,
    name: "SVIP 2",
    price: 150000000,
    multiplier: 5,
    features: [
      "👑 Özel kullanıcı adı",
      "💎 5x oyun kazancı",
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
    description: "VIP satın al.",
  },
];

const SYMBOLS = ["🍒", "🍋", "🍇", "💎", "7️⃣", "👑"];

const FRAMES = [
  {
    id: "gold",
    name: "Altın Çerçeve",
    icon: "🥇",
    price: 10,
    color: "#f5c542",
  },
  {
    id: "diamond",
    name: "Elmas Çerçeve",
    icon: "💎",
    price: 25,
    color: "#38bdf8",
  },
  {
    id: "royal",
    name: "Kraliyet Çerçevesi",
    icon: "👑",
    price: 50,
    color: "#c084fc",
  },
  {
    id: "fire",
    name: "Ateş Çerçevesi",
    icon: "🔥",
    price: 100,
    color: "#fb7185",
  },
];

const panelStyle = {
  background: "#151522",
  border: "1px solid #303047",
  borderRadius: 16,
  padding: 18,
  margin: "18px auto",
  maxWidth: 760,
  boxSizing: "border-box",
};

const buttonStyle = {
  background: "linear-gradient(135deg, #f5c542, #e69b16)",
  color: "#111",
  border: "none",
  borderRadius: 10,
  padding: "12px 16px",
  fontWeight: "bold",
  cursor: "pointer",
};

const inputStyle = {
  display: "block",
  width: "100%",
  maxWidth: 400,
  boxSizing: "border-box",
  margin: "12px auto",
  padding: 13,
  borderRadius: 8,
  background: "#222233",
  color: "white",
  border: "1px solid #555",
};

const formatCoins = (value) =>
  Math.floor(Number(value) || 0).toLocaleString("tr-TR");

const dateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const yesterdayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const defaultData = {
  coins: 1000,
  diamonds: 0,
  vip: 0,
  totalEarned: 0,
  gamesPlayed: 0,
  jackpotWins: 0,
  giftedCoins: 0,
  xp: 0,
  level: 1,
  dailyClaimDate: "",
  dailyStreak: 0,
  profileName: "Royal Oyuncu",
  profileImage: "",
  ownedFrames: [],
  activeFrame: "",
  slotHistory: [],
};

export default function Home() {
  const [page, setPage] = useState("home");
  const [data, setData] = useState(defaultData);
  const [gameDataLoaded, setGameDataLoaded] = useState(false);

  const [notice, setNotice] = useState("");
  const [profileNameInput, setProfileNameInput] = useState("");
  const [giftAmount, setGiftAmount] = useState("100");
  const [giftRecipient, setGiftRecipient] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [user, setUser] = useState(null);
  const [authBusy, setAuthBusy] = useState(false);

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

  const coins = data.coins;
  const diamonds = data.diamonds;
  const vip = data.vip;
  const xp = data.xp;
  const level = data.level;

  const updateData = (changes) => {
    setData((current) => ({
      ...current,
      ...changes,
    }));
  };

  const addCoins = (amount) => {
    setData((current) => ({
      ...current,
      coins: Math.max(0, current.coins + amount),
    }));
  };

  const addXP = (amount) => {
    setData((current) => {
      const nextXP = current.xp + amount;
      const nextLevel = Math.floor(nextXP / 1000) + 1;

      return {
        ...current,
        xp: nextXP,
        level: nextLevel,
      };
    });
  };

  const notify = (message) => setNotice(message);

  // Kayıtlı verileri yükle.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        const merged = {
          ...defaultData,
          ...parsed,
        };

        setData(merged);
        setSlotHistory(
          Array.isArray(merged.slotHistory)
            ? merged.slotHistory.slice(0, 10)
            : []
        );
        setProfileNameInput(merged.profileName || "");
      }
    } catch {
      setNotice("Kayıtlı veriler yüklenemedi.");
    } finally {
      setGameDataLoaded(true);
    }
  }, []);

  // Değişiklikleri kaydet.
  useEffect(() => {
    if (!gameDataLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...data,
          slotHistory,
        })
      );
    } catch {
      setNotice(
        "Depolama alanı dolmuş olabilir. Profil fotoğrafını küçültüp tekrar deneyebilirsin."
      );
    }
  }, [data, slotHistory, gameDataLoaded]);

  // Supabase oturumu.
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: sessionData, error }) => {
      if (!mounted) return;

      if (error) {
        setNotice(error.message);
        return;
      }

      setUser(sessionData.session?.user ?? null);
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

  // Ses efekti.
  const playSound = (type) => {
    if (!soundEnabled || typeof window === "undefined") return;

    try {
      const AudioClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioClass) return;

      const audio = new AudioClass();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();

      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.type = "sine";

      oscillator.frequency.value =
        type === "jackpot" ? 1200 : type === "win" ? 880 : 330;

      gain.gain.setValueAtTime(0.1, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audio.currentTime + 0.2
      );

      oscillator.start();
      oscillator.stop(audio.currentTime + 0.2);

      oscillator.onended = () => {
        audio.close().catch(() => {});
      };
    } catch {
      // Ses desteklenmiyorsa oyuna devam edilir.
    }
  };

  // XP ve seviye bilgisi.
  const xpInLevel = xp % 1000;
  const xpPercent = (xpInLevel / 1000) * 100;

  // Günlük ödül.
  const claimDailyReward = () => {
    const today = dateKey();

    if (data.dailyClaimDate === today) {
      notify("Bugünkü ödülünü zaten aldın. Yarın tekrar gel!");
      return;
    }

    const streak =
      data.dailyClaimDate === yesterdayKey()
        ? Math.min(data.dailyStreak + 1, 7)
        : 1;

    const rewardCoins = 500 + streak * 250;
    const rewardDiamonds = streak >= 7 ? 5 : streak >= 3 ? 2 : 1;

    setData((current) => ({
      ...current,
      coins: current.coins + rewardCoins,
      diamonds: current.diamonds + rewardDiamonds,
      xp: current.xp + 100,
      level: Math.floor((current.xp + 100) / 1000) + 1,
      dailyClaimDate: today,
      dailyStreak: streak,
    }));

    notify(
      `🎁 Günlük ödül: ${formatCoins(rewardCoins)} coin, ${rewardDiamonds} elmas ve 100 XP!`
    );
  };

  // Profil fotoğrafı.
  const handleProfileImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("Lütfen bir resim dosyası seç.");
      return;
    }

    if (file.size > 700 * 1024) {
      notify("Fotoğraf en fazla 700 KB olmalı.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateData({
        profileImage: String(reader.result || ""),
      });
      notify("Profil fotoğrafın güncellendi!");
    };

    reader.onerror = () => {
      notify("Fotoğraf okunamadı.");
    };

    reader.readAsDataURL(file);
  };

  const saveProfileName = () => {
    const name = profileNameInput.trim();

    if (name.length < 2 || name.length > 20) {
      notify("Kullanıcı adı 2–20 karakter arasında olmalı.");
      return;
    }

    updateData({ profileName: name });
    notify("Profilin güncellendi!");
  };

  // Çerçeve satın alma.
  const buyFrame = (frame) => {
    if (data.ownedFrames.includes(frame.id)) {
      updateData({ activeFrame: frame.id });
      notify(`${frame.name} aktif edildi!`);
      return;
    }

    if (diamonds < frame.price) {
      notify("Bu çerçeve için yeterli elmasın yok.");
      return;
    }

    setData((current) => ({
      ...current,
      diamonds: current.diamonds - frame.price,
      ownedFrames: [...current.ownedFrames, frame.id],
      activeFrame: frame.id,
    }));

    notify(`${frame.name} satın alındı ve aktif edildi!`);
  };

  // Demo amaçlı coin hediye etme.
  const giftCoinsToPlayer = () => {
    const amount = Number(giftAmount);
    const recipient = giftRecipient.trim();

    if (recipient.length < 2) {
      notify("Hediye göndereceğin oyuncunun adını yaz.");
      return;
    }

    if (
      !Number.isSafeInteger(amount) ||
      amount < 100 ||
      amount > 1000000
    ) {
      notify("Hediye miktarı 100–1.000.000 coin olmalı.");
      return;
    }

    if (coins < amount) {
      notify("Bu hediye için yeterli coin yok.");
      return;
    }

    updateData({
      coins: coins - amount,
      giftedCoins: data.giftedCoins + amount,
    });

    setGiftRecipient("");
    notify(
      `🎁 ${recipient} oyuncusuna ${formatCoins(amount)} coin hediye edildi. Demo işlemidir; diğer oyuncunun hesabına aktarılmaz.`
    );
  };

  // Kayıt ve giriş.
  const handleAuth = async (mode) => {
    if (!email.trim() || !password) {
      notify("E-posta ve şifreni gir.");
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
        notify("Kayıt oluşturuldu. E-posta adresini doğrula.");
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

  const resetPassword = async () => {
    if (!email.trim()) {
      notify("E-posta adresini gir.");
      return;
    }

    setAuthBusy(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: window.location.origin }
      );

      if (error) throw error;

      notify("Şifre sıfırlama bağlantısı gönderildi.");
    } catch (error) {
      notify(error.message || "Bağlantı gönderilemedi.");
    } finally {
      setAuthBusy(false);
    }
  };

  const updatePassword = async () => {
    if (newPassword.length < 6) {
      notify("Yeni şifren en az 6 karakter olmalı.");
      return;
    }

    setAuthBusy(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setNewPassword("");
      setRecoveryMode(false);
      notify("Şifren değiştirildi!");
    } catch (error) {
      notify(error.message || "Şifre değiştirilemedi.");
    } finally {
      setAuthBusy(false);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    setNotice(error ? error.message : "Çıkış yapıldı.");

    if (!error) setUser(null);
  };

  // VIP satın alma.
  const buyVip = (levelId) => {
    const selected = VIP_LEVELS.find(
      (item) => item.id === levelId
    );

    if (!selected) return;

    if (vip >= levelId) {
      notify("Bu VIP seviyesine zaten sahipsin!");
      return;
    }

    if (coins < selected.price) {
      notify(
        `${formatCoins(selected.price)} coin gerekiyor.`
      );
      return;
    }

    setData((current) => ({
      ...current,
      coins: current.coins - selected.price,
      vip: levelId,
    }));

    notify(`${selected.name} satın alındı! 👑`);
  };

  // Bahis.
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
      notify("Bahis 100–1.000.000 coin arasında olmalı.");
      return;
    }

    setSlotBet(amount);
    setSlotMessage("");
    notify(`Bahis: ${formatCoins(amount)} coin`);
  };

  const calculateSlotPrize = (result, bet) => {
    if (result.every((symbol) => symbol === "👑")) {
      return {
        base: bet * 100,
        label: "👑 KRAL JACKPOT!",
        jackpot: true,
      };
    }

    if (result.every((symbol) => symbol === "7️⃣")) {
      return {
        base: bet * 50,
        label: "🎰 777 JACKPOT!",
        jackpot: true,
      };
    }

    if (result.every((symbol) => symbol === result[0])) {
      return {
        base: bet * 10,
        label: "💎 ÜÇ AYNI!",
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
        label: "✨ İKİ AYNI!",
        jackpot: false,
      };
    }

    return {
      base: 0,
      label: "🍀 Bu sefer olmadı. Tekrar dene!",
      jackpot: false,
    };
  };

  // Slot turu.
  const playSlot = () => {
    if (slotSpinning) return;

    if (!Number.isSafeInteger(slotBet) || slotBet < 100) {
      notify("Geçerli bir bahis seç.");
      setAutoSpin(false);
      return;
    }

    if (coins < slotBet) {
      notify("Yeterli coin yok!");
      setAutoSpin(false);
      return;
    }

    setData((current) => ({
      ...current,
      coins: current.coins - slotBet,
    }));

    setSlotSpinning(true);
    setSlotMessage("");
    setSlotEffect(false);
    playSound("spin");

    const duration = fastSpin ? 350 : 1200;

    setTimeout(() => {
      const result = Array.from(
        { length: 3 },
        () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      );

      const prize = calculateSlotPrize(result, slotBet);
      const multiplier = vip >= 2 ? 5 : vip === 1 ? 2 : 1;
      const payout = Math.floor(prize.base * multiplier);

      setSlotSymbols(result);

      if (payout > 0) {
        setData((current) => ({
          ...current,
          coins: current.coins + payout,
          totalEarned: current.totalEarned + payout,
          diamonds:
            current.diamonds + (prize.jackpot ? 2 : 0),
          xp: current.xp + 25,
          level: Math.floor((current.xp + 25) / 1000) + 1,
          jackpotWins:
            current.jackpotWins + (prize.jackpot ? 1 : 0),
          gamesPlayed: current.gamesPlayed + 1,
        }));

        setSlotEffect(true);
        setSlotMessage(
          `${prize.label} +${formatCoins(payout)} COIN` +
            (multiplier > 1 ? ` · VIP ${multiplier}x` : "") +
            (prize.jackpot ? " · +2 💎" : "")
        );

        playSound(prize.jackpot ? "jackpot" : "win");
      } else {
        setData((current) => ({
          ...current,
          xp: current.xp + 25,
          level: Math.floor((current.xp + 25) / 1000) + 1,
          gamesPlayed: current.gamesPlayed + 1,
        }));

        setSlotMessage(prize.label);
        playSound("lose");
      }

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
        setAutoRemaining((current) => Math.max(0, current - 1));
      }
    }, duration);
  };

  // Otomatik çevirme.
  useEffect(() => {
    if (!autoSpin || slotSpinning || autoRemaining <= 0) {
      if (autoSpin && autoRemaining <= 0) {
        setAutoSpin(false);
      }

      return;
    }

    if (coins < slotBet) {
      setAutoSpin(false);
      setAutoRemaining(0);
      setNotice("Otomatik oyun durdu: yeterli coin kalmadı.");
      return;
    }

    const timer = setTimeout(() => {
      playSlot();
    }, 300);

    return () => clearTimeout(timer);
  }, [autoSpin, slotSpinning, autoRemaining]);

  const startAutoSpin = () => {
    if (slotSpinning || autoSpin) return;

    if (coins < slotBet) {
      notify("Yeterli coin yok!");
      return;
    }

    setAutoRemaining(autoSpinCount);
    setAutoSpin(true);
    setSlotMessage("");
    notify(`${autoSpinCount} turluk otomatik oyun başladı.`);
  };

  const stopAutoSpin = () => {
    setAutoSpin(false);
    setAutoRemaining(0);
    notify("Otomatik oyun durduruldu.");
  };

  const activeVip = VIP_LEVELS.find(
    (item) => item.id === vip
  );

  const achievements = {
    lucky: data.jackpotWins > 0,
    generous: data.giftedCoins >= 2000000,
    rich: data.totalEarned >= 10000000,
    jackpot: data.jackpotWins >= 5,
    legend: data.gamesPlayed >= 100,
    vip: vip >= 1,
  };

  const activeFrame = FRAMES.find(
    (frame) => frame.id === data.activeFrame
  );

  const avatarStyle = {
    width: 105,
    height: 105,
    borderRadius: "50%",
    objectFit: "cover",
    border: `4px solid ${activeFrame?.color || "#f5c542"}`,
    boxShadow: `0 0 18px ${activeFrame?.color || "#f5c542"}55`,
    background: "#222233",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at top, #24203a 0%, #09090f 55%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "20px 12px",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes royalGlow {
          0%, 100% { box-shadow: 0 0 12px #f5c54233; }
          50% { box-shadow: 0 0 28px #f5c54299; }
        }
        @keyframes royalWin {
          0% { transform: scale(1); }
          50% { transform: scale(1.07); }
          100% { transform: scale(1); }
        }
        .royal-slot-symbol { animation: royalGlow 1.5s infinite; }
        .royal-slot-win { animation: royalWin 0.6s ease-in-out 2; }
        .royal-control { min-height: 44px; }
        button:disabled { opacity: .45; cursor: not-allowed; }
        @media (prefers-reduced-motion: reduce) {
          .royal-slot-symbol, .royal-slot-win { animation: none; }
        }
      `}</style>

      <h1
        style={{
          color: "#f5c542",
          fontSize: "clamp(32px, 7vw, 48px)",
          textShadow: "0 0 22px #f5c54255",
          marginBottom: 5,
        }}
      >
        👑 ROYAL SPIN
      </h1>

      <p style={{ color: "#c9c6d8" }}>
        Oyunun patronu sensin!
      </p>

      {/* HIZLI DURUM PANELİ */}
      <section style={panelStyle}>
        <div style={{ color: "#aaa", fontSize: 13 }}>
          COIN BAKİYEN
        </div>

        <div
          style={{
            color: "#f5c542",
            fontSize: 30,
            fontWeight: "bold",
            margin: "6px 0",
          }}
        >
          🪙 {formatCoins(coins)}
        </div>

        <div style={{ color: "#7dd3fc", fontWeight: "bold" }}>
          💎 {formatCoins(diamonds)} Elmas
        </div>

        <div style={{ marginTop: 12, color: "#ddd" }}>
          ⭐ Seviye {level} · {xp} XP
        </div>

        <div
          style={{
            height: 9,
            background: "#303047",
            borderRadius: 10,
            overflow: "hidden",
            marginTop: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${xpPercent}%`,
              background: "linear-gradient(90deg, #38bdf8, #a78bfa)",
              transition: "width .3s",
            }}
          />
        </div>

        <div style={{ fontSize: 12, color: "#aaa", marginTop: 5 }}>
          Sonraki seviyeye {1000 - xpInLevel} XP
        </div>

        <div style={{ marginTop: 10, color: "#c9c6d8" }}>
          {activeVip ? `👑 ${activeVip.name}` : "Standart Üye"}
        </div>
      </section>

      {/* MENÜ */}
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          flexWrap: "wrap",
          maxWidth: 900,
          margin: "22px auto",
        }}
      >
        {[
          ["home", "🏠 Ana Sayfa"],
          ["slot", "🎰 Slot"],
          ["profile", "👤 Profil"],
          ["diamonds", "💎 Elmas"],
          ["daily", "🎁 Günlük Ödül"],
          ["gift", "🎁 Hediye"],
          ["vip", "👑 VIP"],
          ["badges", "🏆 Rozetler"],
          ["rooms", "🎙️ Odalar"],
          ["login", "🔑 Giriş"],
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
              background: page === id ? "#f5c542" : "#222233",
              color: page === id ? "#111" : "white",
              border: "1px solid #45455a",
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
          <h2 style={{ color: "#f5c542" }}>
            ✨ Royal Spin'e Hoş Geldin!
          </h2>

          <p style={{ color: "#ddd" }}>
            Oyna, XP kazan, seviyeni yükselt ve rozetlerini topla.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 20,
            }}
          >
            <button
              className="royal-control"
              style={buttonStyle}
              onClick={() => setPage("slot")}
            >
              🎰 Slot Oyna
            </button>

            <button
              className="royal-control"
              style={buttonStyle}
              onClick={() => setPage("profile")}
            >
              👤 Profilim
            </button>

            <button
              className="royal-control"
              style={buttonStyle}
              onClick={() => setPage("daily")}
            >
              🎁 Günlük Ödül
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
              marginTop: 22,
            }}
          >
            {[
              ["🎮", "Oynanan Oyun", data.gamesPlayed],
              ["🎰", "Jackpot", data.jackpotWins],
              ["💰", "Toplam Kazanç", formatCoins(data.totalEarned)],
              ["🎁", "Hediye Edilen", formatCoins(data.giftedCoins)],
            ].map(([icon, label, value]) => (
              <div
                key={label}
                style={{
                  background: "#222233",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <div style={{ fontSize: 25 }}>{icon}</div>
                <div style={{ color: "#aaa", fontSize: 12 }}>
                  {label}
                </div>
                <strong style={{ color: "#f5c542" }}>
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SLOT */}
      {page === "slot" && (
        <section
          style={{
            ...panelStyle,
            maxWidth: 540,
            background: "linear-gradient(180deg, #241333, #09090f)",
            border: "2px solid #f5c542",
            boxShadow: "0 0 30px #f5c54233",
          }}
        >
          <h2 style={{ color: "#f5c542", fontSize: 30 }}>
            👑 ROYAL MEGA SLOT
          </h2>

          <p style={{ color: "#ddd" }}>
            Bahsini seç, makaraları çevir ve ödül kazan!
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              margin: "24px 0",
              padding: 12,
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
                  height: "clamp(75px, 19vw, 100px)",
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(180deg, #fff, #ded8f5)",
                  borderRadius: 12,
                  fontSize: "clamp(30px, 8vw, 48px)",
                  boxShadow: "inset 0 0 12px #f5c542",
                }}
              >
                {slotSpinning ? "🎰" : symbol}
              </div>
            ))}
          </div>

          <h3 style={{ color: "#f5c542" }}>
            🪙 {formatCoins(coins)} Coin
          </h3>

          <h3>💰 Bahis Miktarı</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 8,
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
                  background: slotBet === amount ? "#f5c542" : "#29243a",
                  color: slotBet === amount ? "#111" : "white",
                }}
              >
                🪙 {formatCoins(amount)}
              </button>
            ))}
          </div>

          <input
            aria-label="Özel bahis"
            type="number"
            min="100"
            max="1000000"
            value={customBet}
            disabled={slotSpinning || autoSpin}
            onChange={(event) => setCustomBet(event.target.value)}
            style={inputStyle}
          />

          <button
            className="royal-control"
            disabled={slotSpinning || autoSpin}
            style={buttonStyle}
            onClick={applyCustomBet}
          >
            Bahsi Uygula
          </button>

          <p>
            Seçili bahis:{" "}
            <strong style={{ color: "#f5c542" }}>
              {formatCoins(slotBet)} coin
            </strong>
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 8,
              margin: "18px 0",
            }}
          >
            <button
              className="royal-control"
              style={{
                ...buttonStyle,
                background: fastSpin ? "#16a34a" : "#34344c",
                color: "white",
              }}
              onClick={() => setFastSpin((value) => !value)}
            >
              {fastSpin ? "⚡ Hızlı Açık" : "⚡ Hızlı Kapalı"}
            </button>

            <button
              className="royal-control"
              style={{
                ...buttonStyle,
                background: soundEnabled ? "#16a34a" : "#34344c",
                color: "white",
              }}
              onClick={() => setSoundEnabled((value) => !value)}
            >
              {soundEnabled ? "🔊 Ses Açık" : "🔇 Ses Kapalı"}
            </button>
          </div>

          <button
            className="royal-control"
            disabled={slotSpinning || autoSpin || coins < slotBet}
            style={{
              ...buttonStyle,
              width: "100%",
              fontSize: 19,
              padding: 16,
            }}
            onClick={playSlot}
          >
            {slotSpinning
              ? "🎰 ÇEVRİLİYOR..."
              : `🎰 ${formatCoins(slotBet)} COIN İLE ÇEVİR`}
          </button>

          <h3 style={{ color: "#f5c542", marginTop: 25 }}>
            🔄 Otomatik Çevirme
          </h3>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {[10, 25, 50].map((count) => (
              <button
                key={count}
                className="royal-control"
                disabled={slotSpinning || autoSpin}
                style={{
                  ...buttonStyle,
                  background:
                    autoSpinCount === count ? "#f5c542" : "#34344c",
                  color: autoSpinCount === count ? "#111" : "white",
                }}
                onClick={() => setAutoSpinCount(count)}
              >
                {count} Tur
              </button>
            ))}
          </div>

          {!autoSpin ? (
            <button
              className="royal-control"
              disabled={slotSpinning || coins < slotBet}
              style={{
                ...buttonStyle,
                background: "#7c3aed",
                color: "white",
                width: "100%",
                marginTop: 10,
              }}
              onClick={startAutoSpin}
            >
              ▶️ {autoSpinCount} Turu Başlat
            </button>
          ) : (
            <button
              className="royal-control"
              style={{
                ...buttonStyle,
                background: "#dc2626",
                color: "white",
                width: "100%",
                marginTop: 10,
              }}
              onClick={stopAutoSpin}
            >
              ⏹️ Durdur
            </button>
          )}

          {autoSpin && (
            <p style={{ color: "#c4b5fd" }}>
              Kalan tur: {autoRemaining}
            </p>
          )}

          {slotMessage && (
            <div
              role="status"
              className={slotEffect ? "royal-slot-win" : ""}
              style={{
                marginTop: 20,
                padding: 15,
                borderRadius: 12,
                background: "#171326",
                border: "1px solid #f5c542",
                color: "#f5c542",
                fontWeight: "bold",
                overflowWrap: "anywhere",
              }}
            >
              {slotMessage}
            </div>
          )}

          <div
            style={{
              marginTop: 22,
              padding: 14,
              background: "#11101b",
              borderRadius: 12,
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
            <p>Üç aynı sembol — Bahsin 10 katı</p>
            <p>İki aynı sembol — Bahsin 2 katı</p>
            <p style={{ color: "#aaa", fontSize: 12 }}>
              VIP çarpanı kazanca uygulanır. Jackpot ayrıca 2 elmas verir.
            </p>
          </div>

          <div
            style={{
              marginTop: 22,
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
              slotHistory.map((item) => (
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
                  <div>
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
                      color: item.payout > 0 ? "#5be39a" : "#ff7777",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.payout > 0
                      ? `+${formatCoins(item.payout)}`
                      : "0"}
                  </strong>
                </div>
              ))
            )}
          </div>

          <p style={{ color: "#aaa", fontSize: 12, marginTop: 20 }}>
            Demo oyunudur. Coin ve elmasların gerçek para değeri yoktur.
          </p>
        </section>
      )}

      {/* PROFİL */}
      {page === "profile" && (
        <section style={panelStyle}>
          <h2 style={{ color: "#f5c542" }}>👤 OYUNCU PROFİLİ</h2>

          <div style={{ margin: "22px auto" }}>
            {data.profileImage ? (
              <img
                src={data.profileImage}
                alt="Profil fotoğrafı"
                style={avatarStyle}
              />
            ) : (
              <div
                style={{
                  ...avatarStyle,
                  display: "grid",
                  placeItems: "center",
                  margin: "auto",
                  fontSize: 45,
                  boxSizing: "border-box",
                }}
              >
                👑
              </div>
            )}
          </div>

          <h2
            style={{
              color: activeVip ? "#f5c542" : "white",
              overflowWrap: "anywhere",
            }}
          >
            {data.profileName}
          </h2>

          {activeVip && (
            <p style={{ color: "#f5c542" }}>
              ☑️ {activeVip.name} Üyesi
            </p>
          )}

          <p style={{ color: "#c9c6d8" }}>
            ⭐ Seviye {level} · {xp} XP
          </p>

          <label
            style={{
              display: "block",
              margin: "20px auto",
              color: "#ddd",
            }}
          >
            Profil fotoğrafı seç
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImage}
              style={{
                display: "block",
                margin: "12px auto",
                maxWidth: "100%",
              }}
            />
          </label>

          <input
            style={inputStyle}
            maxLength={20}
            placeholder="Yeni oyuncu adın"
            value={profileNameInput}
            onChange={(event) =>
              setProfileNameInput(event.target.value)
            }
          />

          <button
            className="royal-control"
            style={buttonStyle}
            onClick={saveProfileName}
          >
            Profil Adını Kaydet
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
              marginTop: 24,
            }}
          >
            {[
              ["🎮", "Oyun", data.gamesPlayed],
              ["🎰", "Jackpot", data.jackpotWins],
              ["💰", "Toplam Kazanç", formatCoins(data.totalEarned)],
              ["🎁", "Hediye", formatCoins(data.giftedCoins)],
            ].map(([icon, label, value]) => (
              <div
                key={label}
                style={{
                  padding: 12,
                  background: "#222233",
                  borderRadius: 12,
                }}
              >
                <div style={{ fontSize: 24 }}>{icon}</div>
                <div style={{ color: "#aaa", fontSize: 12 }}>{label}</div>
                <strong style={{ color: "#f5c542" }}>{value}</strong>
              </div>
            ))}
          </div>

          <button
            className="royal-control"
            style={{ ...buttonStyle, marginTop: 22 }}
            onClick={() => setPage("diamonds")}
          >
            💎 Çerçeve Mağazasını Aç
          </button>
        </section>
      )}

      {/* ELMAS VE ÇERÇEVE MAĞAZASI */}
      {page === "diamonds" && (
        <section>
          <div style={panelStyle}>
            <h2 style={{ color: "#7dd3fc" }}>💎 ELMAS MAĞAZASI</h2>

            <div
              style={{
                fontSize: 28,
                color: "#7dd3fc",
                fontWeight: "bold",
              }}
            >
              💎 {formatCoins(diamonds)}
            </div>

            <p style={{ color: "#ddd" }}>
              Jackpot kazanarak ve günlük ödüllerle elmas topla.
            </p>

            <p style={{ color: "#aaa", fontSize: 12 }}>
              Bu demo sürümünde gerçek para ile elmas satın alma yoktur.
            </p>
          </div>

          <h2 style={{ color: "#f5c542" }}>🖼️ ÇERÇEVE MAĞAZASI</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              maxWidth: 850,
              margin: "20px auto",
            }}
          >
            {FRAMES.map((frame) => {
              const owned = data.ownedFrames.includes(frame.id);
              const active = data.activeFrame === frame.id;

              return (
                <article
                  key={frame.id}
                  style={{
                    ...panelStyle,
                    margin: 0,
                    borderColor: frame.color,
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      border: `5px solid ${frame.color}`,
                      borderRadius: "50%",
                      margin: "0 auto 12px",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 36,
                    }}
                  >
                    {frame.icon}
                  </div>

                  <h3 style={{ color: frame.color }}>{frame.name}</h3>

                  <p>💎 {frame.price} elmas</p>

                  <button
                    className="royal-control"
                    style={{
                      ...buttonStyle,
                      width: "100%",
                      opacity: active ? 0.7 : 1,
                    }}
                    disabled={active}
                    onClick={() => buyFrame(frame)}
                  >
                    {active
                      ? "✓ Aktif"
                      : owned
                        ? "Çerçeveyi Kullan"
                        : "Satın Al"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* GÜNLÜK ÖDÜL */}
      {page === "daily" && (
        <section style={panelStyle}>
          <h2 style={{ color: "#f5c542" }}>🎁 GÜNLÜK ÖDÜL</h2>

          <div style={{ fontSize: 55, margin: "20px 0" }}>🎁</div>

          <h3>
            🔥 Günlük seri: {data.dailyStreak} gün
          </h3>

          <p style={{ color: "#ddd" }}>
            Her gün giriş yaparak coin, elmas ve XP kazan.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
              margin: "20px 0",
            }}
          >
            <div style={{ background: "#222233", padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 28 }}>🪙</div>
              <strong>500–2.250 Coin</strong>
            </div>

            <div style={{ background: "#222233", padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 28 }}>💎</div>
              <strong>1–5 Elmas</strong>
            </div>
          </div>

          <p style={{ color: "#c9c6d8" }}>
            3 günlük seride daha fazla elmas, 7 günlük seride en yüksek
            günlük elmas ödülünü kazanırsın.
          </p>

          <button
            className="royal-control"
            disabled={data.dailyClaimDate === dateKey()}
            style={{
              ...buttonStyle,
              width: "100%",
              fontSize: 18,
              opacity: data.dailyClaimDate === dateKey() ? 0.5 : 1,
            }}
            onClick={claimDailyReward}
          >
            {data.dailyClaimDate === dateKey()
              ? "✓ Bugünkü Ödül Alındı"
              : "🎁 Ödülümü Al"}
          </button>
        </section>
      )}

      {/* COIN HEDİYE */}
      {page === "gift" && (
        <section style={panelStyle}>
          <h2 style={{ color: "#f5c542" }}>🎁 COIN HEDİYE ET</h2>

          <p style={{ color: "#ddd" }}>
            Demo sürümünde hediye işlemleri yalnızca kendi oyun
            istatistiklerini günceller.
          </p>

          <div style={{ color: "#f5c542", fontWeight: "bold" }}>
            🪙 Bakiyen: {formatCoins(coins)}
          </div>

          <input
            style={inputStyle}
            placeholder="Oyuncu adı"
            maxLength={20}
            value={giftRecipient}
            onChange={(event) => setGiftRecipient(event.target.value)}
          />

          <input
            style={inputStyle}
            type="number"
            min="100"
            max="1000000"
            value={giftAmount}
            onChange={(event) => setGiftAmount(event.target.value)}
            placeholder="Hediye coin miktarı"
          />

          <button
            className="royal-control"
            style={{ ...buttonStyle, width: "100%" }}
            onClick={giftCoinsToPlayer}
          >
            🎁 Coin Hediyesi Gönder
          </button>

          <p style={{ color: "#aaa", fontSize: 12, marginTop: 16 }}>
            Gerçek oyuncular arasında transfer için sunucu tarafında
            güvenli bir hediye sistemi kurulmalıdır.
          </p>
        </section>
      )}

      {/* VIP MARKET */}
      {page === "vip" && (
        <section>
          <h2 style={{ color: "#f5c542" }}>👑 VIP MARKET</h2>

          <p>Coinlerinle VIP seviyeni yükselt.</p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 14,
              maxWidth: 800,
              margin: "20px auto",
            }}
          >
            {VIP_LEVELS.map((item) => {
              const owned = vip >= item.id;

              return (
                <article
                  key={item.id}
                  style={{
                    ...panelStyle,
                    margin: 0,
                    borderColor: item.id === 2 ? "#c084fc" : "#f5c542",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 26,
                      color: item.id === 2 ? "#d8a7ff" : "#f5c542",
                    }}
                  >
                    {item.id === 1 ? "💎" : "👑"} {item.name}
                  </h3>

                  <div style={{ fontSize: 21, margin: "18px 0" }}>
                    🪙 {formatCoins(item.price)}
                  </div>

                  {item.features.map((feature) => (
                    <p key={feature} style={{ color: "#ddd" }}>
                      {feature}
                    </p>
                  ))}

                  <button
                    className="royal-control"
                    disabled={owned}
                    style={{
                      ...buttonStyle,
                      width: "100%",
                      marginTop: 14,
                    }}
                    onClick={() => buyVip(item.id)}
                  >
                    {owned ? "✓ Sahipsin" : "VIP Satın Al"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ROZETLER */}
      {page === "badges" && (
        <section>
          <h2 style={{ color: "#f5c542" }}>🏆 BAŞARI ROZETLERİ</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              maxWidth: 850,
              margin: "20px auto",
            }}
          >
            {ACHIEVEMENTS.map((item) => {
              const unlocked = achievements[item.id];

              return (
                <article
                  key={item.id}
                  style={{
                    ...panelStyle,
                    margin: 0,
                    opacity: unlocked ? 1 : 0.7,
                    borderColor: unlocked ? "#f5c542" : "#303047",
                  }}
                >
                  <div style={{ fontSize: 42 }}>{item.icon}</div>

                  <h3 style={{ color: unlocked ? "#f5c542" : "white" }}>
                    {item.name}
                  </h3>

                  <p style={{ color: "#c9c6d8", fontSize: 14 }}>
                    {item.description}
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

      {/* SESLİ ODALAR */}
      {page === "rooms" && (
        <section style={panelStyle}>
          <h2>🎙️ Sesli Odalar</h2>
          <p style={{ color: "#ddd" }}>
            Sesli oda ve mikrofon sistemi henüz bağlanmadı.
          </p>
          <p style={{ color: "#aaa", fontSize: 13 }}>
            Gerçek zamanlı sesli sohbet için ayrıca bir ses sunucusu
            veya uygun bir sesli iletişim hizmeti entegre edilmelidir.
          </p>
        </section>
      )}

      {/* GİRİŞ */}
      {page === "login" && (
        <section style={panelStyle}>
          <h2 style={{ color: "#f5c542" }}>👑 ROYAL SPIN ÜYELİK</h2>

          {user ? (
            <>
              <h3 style={{ color: "#5be39a" }}>
                ✓ Giriş yapıldı
              </h3>

              <p>Hesap: {user.email}</p>

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
                style={inputStyle}
                type="password"
                placeholder="Yeni şifre (en az 6 karakter)"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />

              <button
                className="royal-control"
                disabled={authBusy}
                style={buttonStyle}
                onClick={updatePassword}
              >
                {authBusy ? "Bekle..." : "Şifreyi Kaydet"}
              </button>
            </>
          ) : (
            <>
              <input
                style={inputStyle}
                type="email"
                placeholder="E-posta adresin"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <input
                style={inputStyle}
                type="password"
                placeholder="Şifren"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <button
                  className="royal-control"
                  disabled={authBusy}
                  style={buttonStyle}
                  onClick={() => handleAuth("signup")}
                >
                  📝 Kayıt Ol
                </button>

                <button
                  className="royal-control"
                  disabled={authBusy}
                  style={{
                    ...buttonStyle,
                    background: "#34344c",
                    color: "white",
                  }}
                  onClick={() => handleAuth("login")}
                >
                  🔑 Giriş Yap
                </button>
              </div>

              <button
                className="royal-control"
                disabled={authBusy}
                style={{
                  background: "transparent",
                  color: "#f5c542",
                  border: "none",
                  padding: 16,
                  cursor: "pointer",
                }}
                onClick={resetPassword}
              >
                Şifremi Unuttum
              </button>
            </>
          )}
        </section>
      )}

      <footer
        style={{
          marginTop: 50,
          padding: 20,
          color: "#777",
          borderTop: "1px solid #242432",
        }}
      >
        ROYAL SPIN © 2026

        <p style={{ fontSize: 12 }}>
          Demo oyunudur. Oyun verileri bu tarayıcıda saklanır.
        </p>
      </footer>
    </main>
  );
}
