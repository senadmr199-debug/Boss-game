"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://klmjyeljhfozthxocjit.supabase.co",
  "sb_publishable_omCeokV2Z1-LIBvDRVOQuQ_Y6htlTvl"
);

const STORAGE_KEY = "boss-game-data";

const SYMBOLS = ["🍒", "🍋", "🍇", "💎", "7️⃣", "👑"];

const DEFAULT_DATA = {
  coins: 1000,
  diamonds: 0,
  vip: 0,
  vipLevel: 0,
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

const VIP_LEVELS = [
  { id: 1, name: "VIP 1", price: 10000, multiplier: 1.1, features: ["✨ VIP kullanıcı adı", "💰 1.1x oyun kazancı"] },
  { id: 2, name: "VIP 2", price: 50000, multiplier: 1.2, features: ["✨ Özel kullanıcı adı", "💰 1.2x oyun kazancı"] },
  { id: 3, name: "VIP 3", price: 100000, multiplier: 1.3, features: ["🌟 Parlak kullanıcı adı", "💰 1.3x oyun kazancı"] },
  { id: 4, name: "VIP 4", price: 500000, multiplier: 1.4, features: ["🌟 Özel profil görünümü", "💰 1.4x oyun kazancı"] },
  { id: 5, name: "VIP 5", price: 1000000, multiplier: 1.5, features: ["👑 Prestijli üyelik", "💰 1.5x oyun kazancı"] },
  { id: 6, name: "VIP 6", price: 5000000, multiplier: 1.6, features: ["💎 Elit kullanıcı adı", "💰 1.6x oyun kazancı"] },
  { id: 7, name: "VIP 7", price: 10000000, multiplier: 1.7, features: ["🔥 Efsane üyelik", "💰 1.7x oyun kazancı"] },
  { id: 8, name: "VIP 8", price: 50000000, multiplier: 1.8, features: ["🏆 En üst VIP seviyesi", "💰 1.8x oyun kazancı"] },
];

const SVIP_LEVELS = [
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
    description: "2.000.000 coin hediye et.",
  },
  {
    id: "rich",
    name: "Para Babası",
    icon: "💰",
    description: "10.000.000 coin kazan.",
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
  width: "100%",
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
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const yesterdayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export default function Home() {
  const [page, setPage] = useState("home");
  const [supportOpen, setSupportOpen] = useState(false);

const [supportInput, setSupportInput] = useState("");

const [supportMessages, setSupportMessages] = useState([
  {
    from: "bot",
    text: "Merhaba! 👑 Royal Spin müşteri hizmetlerine hoş geldin. Sana nasıl yardımcı olabilirim?",
  },
]);
  const [data, setData] = useState(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
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

 const [adminPlayers, setAdminPlayers] = useState([]);
const [adminTargetEmail, setAdminTargetEmail] = useState("");
const [adminCoinChange, setAdminCoinChange] = useState("10000");
const [adminDiamondChange, setAdminDiamondChange] = useState("0");
const [adminVipLevel, setAdminVipLevel] = useState("");
const [adminBusy, setAdminBusy] = useState(false); 
  const [slotSymbols, setSlotSymbols] = useState([
    "🍒",
    "👑",
    "💎",
  ]);

  const [slotSpinning, setSlotSpinning] = useState(false);
  const [zeusBet, setZeusBet] = useState(100);
const [zeusSpinning, setZeusSpinning] = useState(false);
const [zeusGrid, setZeusGrid] = useState(Array(30).fill("💎"));
const [zeusMessage, setZeusMessage] = useState(
  "Bahsini seç ve Zeus'un gücünü dene!"
);
const [zeusFreeSpins, setZeusFreeSpins] = useState(0);
  const [wheelBet, setWheelBet] = useState(1000);
const [wheelSpinning, setWheelSpinning] = useState(false);
const [wheelResult, setWheelResult] = useState(null);
const [wheelMessage, setWheelMessage] = useState("");
const [wheelLeaderboard, setWheelLeaderboard] = useState([]);
  const [slotMessage, setSlotMessage] = useState("");
  const [slotBet, setSlotBet] = useState(100);
  const [customBet, setCustomBet] = useState("100");

  const [fastSpin, setFastSpin] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [autoSpinCount, setAutoSpinCount] = useState(10);
  const [autoRemaining, setAutoRemaining] = useState(0);

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [slotEffect, setSlotEffect] = useState(false);

  const spinTimerRef = useRef(null);
  const autoTimerRef = useRef(null);
  const latestRef = useRef({});

  const coins = data.coins;
  const diamonds = data.diamonds;
  const vip = data.vip;
  const xp = data.xp;
  const level = data.level;

  const notify = useCallback((message) => {
    setNotice(message);
  }, []);

  const addXP = useCallback((amount) => {
    setData((current) => {
      const nextXP = current.xp + amount;
const answerSupport = (rawText) => {
  const text = rawText.trim();
  if (!text) return;

  setSupportMessages((prev) => [
    ...prev,
    { from: "user", text },
  ]);

  setSupportInput("");

  const lower = text.toLocaleLowerCase("tr-TR");
  let reply = "Sorununu biraz daha ayrıntılı anlatabilir misin?";

  if (
    lower.includes("slot") ||
    lower.includes("oyun") ||
    lower.includes("açılmıyor")
  ) {
    reply =
      "🎰 Slot oyunu açılmıyorsa sayfayı yenilemeyi dene. Sorun devam ederse hangi ekranda kaldığını belirt.";
  } else if (
    lower.includes("coin") ||
    lower.includes("elmas") ||
    lower.includes("bakiye")
  ) {
    reply =
      "🪙 Coin veya elmas bakiyenle ilgili sorun yaşıyorsan sayfayı yenile ve bakiyeni tekrar kontrol et.";
  } else if (
    lower.includes("giriş") ||
    lower.includes("şifre") ||
    lower.includes("hesap") ||
    lower.includes("kayıt")
  ) {
    reply =
      "🔐 Hesabına erişemiyorsan giriş bilgilerini kontrol et. Şifreni kimseyle paylaşma.";
  } else if (lower.includes("vip")) {
    reply =
      "👑 VIP özellikleriyle ilgili sorununu yaz. Hangi VIP seviyesini kullandığını belirt.";
  } else if (
    lower.includes("insan") ||
    lower.includes("temsilci") ||
    lower.includes("canlı destek")
  ) {
    reply =
      "💬 Bu otomatik destek botudur; şu anda canlı bir temsilciye bağlanma özelliği bulunmuyor.";
  } else if (
    lower.includes("merhaba") ||
    lower.includes("selam")
  ) {
    reply =
      "Merhaba! 👑 Royal Spin desteğe hoş geldin. Slot, coin, elmas veya VIP konusunda yardımcı olabilirim.";
  }

  setTimeout(() => {
    setSupportMessages((prev) => [
      ...prev,
      { from: "bot", text: reply },
    ]);
  }, 300);
};
      return {
        ...current,
        xp: nextXP,
        level: Math.floor(nextXP / 1000) + 1,
      };
    });
  }, []);
    const spinLockRef = useRef(false);

  // Kayıtlı oyun verilerini yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        setData({
          ...DEFAULT_DATA,
          ...parsed,
        });
      }
    } catch (error) {
      console.error("Oyun verileri yüklenemedi:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Oyun verilerini telefona kaydet
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Oyun verileri kaydedilemedi:", error);
    }
  }, [data, loaded]);

  // Oturum açma durumunu kontrol et
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (mounted) {
        setUser(sessionData.session?.user ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Güncel değerleri slot sistemine aktar
  latestRef.current = {
    data,
    slotBet,
    fastSpin,
    soundEnabled,
  };

  // Basit ses efekti
  const playSound = useCallback(() => {
    if (!latestRef.current.soundEnabled) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      const audio = new AudioContextClass();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 600;

      gain.gain.value = 0.05;

      oscillator.connect(gain);
      gain.connect(audio.destination);

      oscillator.start();

      oscillator.stop(audio.currentTime + 0.12);
      oscillator.onended = () => audio.close();
    } catch (error) {
      console.log("Ses oynatılamadı.");
    }
  }, []);

  // Slot oyununu başlat
  const playSlot = useCallback(() => {
    if (spinLockRef.current) return;

    const current = latestRef.current;
    const bet = Math.floor(Number(current.slotBet));

    if (!Number.isFinite(bet) || bet < 100) {
      setSlotMessage("⚠️ Minimum bahis 100 coin!");
      return;
    }

    if (bet > 1000000) {
      setSlotMessage("⚠️ Maksimum bahis 1.000.000 coin!");
      return;
    }

    if (current.data.coins < bet) {
      setSlotMessage("❌ Yeterli coin yok!");
      setAutoSpin(false);
      setAutoRemaining(0);
      return;
    }

    spinLockRef.current = true;
    setSlotSpinning(true);
    setSlotEffect(false);
    setSlotMessage("🎰 Şansını deniyorsun...");

    // Bahis miktarını düşür
    setData((previous) => ({
      ...previous,
      coins: previous.coins - bet,
      gamesPlayed: previous.gamesPlayed + 1,
    }));

    playSound();

    const delay = current.fastSpin ? 500 : 1400;

    spinTimerRef.current = setTimeout(() => {
      const symbols = SYMBOLS;

      const result = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ];

      setSlotSymbols(result);

      const allSame =
        result[0] === result[1] && result[1] === result[2];

      const twoSame =
        result[0] === result[1] ||
        result[1] === result[2] ||
        result[0] === result[2];

      let multiplier = 0;
      let message = "😅 Bu sefer olmadı! Tekrar dene.";

      if (allSame && result[0] === "👑") {
        multiplier = 100;
        message = "👑 KRALİYET JACKPOT! Muhteşem!";
      } else if (allSame && result[0] === "7️⃣") {
        multiplier = 50;
        message = "🎉 JACKPOT! Büyük kazanç!";
      } else if (allSame) {
        multiplier = 10;
        message = "🔥 Üçlü eşleşme! Kazandın!";
      } else if (twoSame) {
        multiplier = 2;
        message = "✨ İkili eşleşme! Kazandın!";
      }

      const currentVIP = latestRef.current.data.vip;

      const vipMultiplier =
        currentVIP >= 2 ? 5 : currentVIP >= 1 ? 2 : 1;

      const payout = Math.floor(
        bet * multiplier * vipMultiplier
      );

      setData((previous) => {
        const nextHistory = [
          {
            symbols: result,
            bet,
            payout,
            date: new Date().toLocaleTimeString("tr-TR"),
          },
          ...previous.slotHistory,
        ].slice(0, 10);

        return {
          ...previous,
          coins: previous.coins + payout,
          totalEarned: previous.totalEarned + payout,
          diamonds:
            previous.diamonds +
            (multiplier >= 50 ? 2 : multiplier >= 10 ? 1 : 0),
          jackpotWins:
            previous.jackpotWins + (multiplier >= 50 ? 1 : 0),
          xp: previous.xp + 25,
          level: Math.floor((previous.xp + 25) / 1000) + 1,
          slotHistory: nextHistory,
        };
      });

      if (payout > 0) {
        message += ` +${formatCoins(payout)} coin`;
        setSlotEffect(true);
      }

      setSlotMessage(message);
      setSlotSpinning(false);
      spinLockRef.current = false;

      if (autoSpin) {
        setAutoRemaining((previous) => Math.max(0, previous - 1));
      }

      if (autoSpin && autoRemaining <= 1) {
        setAutoSpin(false);
        setAutoRemaining(0);
      }
    }, delay);
  }, [playSound, autoSpin, autoRemaining]);

  // Otomatik çevirme sistemi
  useEffect(() => {
    if (!autoSpin || slotSpinning || autoRemaining <= 0) {
      return;
    }

    autoTimerRef.current = setTimeout(() => {
      playSlot();
    }, 300);

    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
      }
    };
  }, [autoSpin, slotSpinning, autoRemaining, playSlot]);

  // Sayfadan ayrılırken zamanlayıcıları temizle
  useEffect(() => {
    return () => {
      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
      }

      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
      }
    };
  }, []);

  // Bahis miktarını değiştir
  const changeBet = (amount) => {
    const nextBet = Math.floor(Number(amount));

    if (!Number.isFinite(nextBet)) return;

    const safeBet = Math.max(100, Math.min(1000000, nextBet));

    setSlotBet(safeBet);
    setCustomBet(String(safeBet));
  };

  // Otomatik oyunu başlat
  const startAutoSpin = () => {
    if (slotSpinning || spinLockRef.current) return;

    if (data.coins < slotBet) {
      setSlotMessage("❌ Otomatik oyun için yeterli coin yok!");
      return;
    }

    setAutoRemaining(autoSpinCount);
    setAutoSpin(true);
    setSlotMessage(`🔄 ${autoSpinCount} otomatik oyun başlatıldı!`);
  };

  // Otomatik oyunu durdur
  const stopAutoSpin = () => {
    setAutoSpin(false);
    setAutoRemaining(0);
    setSlotMessage("⏹️ Otomatik oyun durduruldu.");
  };

  // Coin kazanma işlemi
  const addCoins = (amount) => {
    const value = Math.floor(Number(amount));

    if (!Number.isFinite(value) || value <= 0) return;

    setData((previous) => ({
      ...previous,
      coins: previous.coins + value,
      totalEarned: previous.totalEarned + value,
    }));
  };

  // Elmas ekleme işlemi
  const addDiamonds = (amount) => {
    const value = Math.floor(Number(amount));

    if (!Number.isFinite(value) || value <= 0) return;

    setData((previous) => ({
      ...previous,
      diamonds: previous.diamonds + value,
    }));
  };
    // Üye ol
  const handleSignUp = async () => {
    if (!email.trim() || !password) {
      notify("⚠️ E-posta ve şifre gir!");
      return;
    }

    if (password.length < 6) {
      notify("⚠️ Şifre en az 6 karakter olmalı!");
      return;
    }

    setAuthBusy(true);

    try {
      const { data: result, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (result.session) {
        setUser(result.session.user);
        notify("✅ Kayıt başarılı!");
      } else {
        notify("📩 E-postanı kontrol et. Doğrulama gerekiyorsa bağlantıya tıkla.");
      }
    } catch (error) {
      notify("❌ Kayıt başarısız: " + error.message);
    } finally {
      setAuthBusy(false);
    }
  };

  // Giriş yap
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      notify("⚠️ E-posta ve şifre gir!");
      return;
    }

    setAuthBusy(true);

    try {
      const { data: result, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) throw error;

      setUser(result.user);
      notify("✅ Giriş başarılı!");
      setPage("home");
    } catch (error) {
      notify("❌ Giriş başarısız: " + error.message);
    } finally {
      setAuthBusy(false);
    }
  };

  // Şifre yenileme e-postası gönder
  const handlePasswordRecovery = async () => {
    if (!email.trim()) {
      notify("⚠️ Önce e-posta adresini yaz!");
      return;
    }

    setAuthBusy(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: window.location.origin,
        }
      );

      if (error) throw error;

      notify("📩 Şifre yenileme bağlantısı e-postana gönderildi.");
    } catch (error) {
      notify("❌ İşlem başarısız: " + error.message);
    } finally {
      setAuthBusy(false);
    }
  };

  // Yeni şifre kaydet
  const handleNewPassword = async () => {
    if (newPassword.length < 6) {
      notify("⚠️ Yeni şifre en az 6 karakter olmalı!");
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
      notify("✅ Şifren başarıyla değiştirildi.");
    } catch (error) {
      notify("❌ Şifre değiştirilemedi: " + error.message);
    } finally {
      setAuthBusy(false);
    }
  };

  // Çıkış yap
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      notify("❌ Çıkış yapılamadı: " + error.message);
      return;
    }

    setUser(null);
    setPage("home");
    notify("👋 Oturum kapatıldı.");
  };

  // Günlük ödül
  const claimDailyReward = () => {
    const today = dateKey();

    if (data.dailyClaimDate === today) {
      notify("⏳ Günlük ödülünü bugün zaten aldın!");
      return;
    }

    const streak =
      data.dailyClaimDate === yesterdayKey()
        ? data.dailyStreak + 1
        : 1;

    const reward = Math.min(500 + (streak - 1) * 100, 2000);

    setData((previous) => ({
      ...previous,
      coins: previous.coins + reward,
      totalEarned: previous.totalEarned + reward,
      dailyClaimDate: today,
      dailyStreak: streak,
    }));

    notify(
      `🎁 Günlük ödülün: ${formatCoins(reward)} coin! ${streak}. gün`
    );
  };

  // Başka bir oyuncuya coin hediye et
  const sendGift = () => {
    const amount = Math.floor(Number(giftAmount));

    if (!giftRecipient.trim()) {
      notify("⚠️ Hediye alacak oyuncunun adını gir!");
      return;
    }

    if (!Number.isFinite(amount) || amount < 1) {
      notify("⚠️ Geçerli bir coin miktarı gir!");
      return;
    }

    if (amount > data.coins) {
      notify("❌ Yeterli coin yok!");
      return;
    }

    setData((previous) => ({
      ...previous,
      coins: previous.coins - amount,
      giftedCoins: previous.giftedCoins + amount,
    }));

    setGiftRecipient("");
    notify(
      `🎁 ${giftRecipient} için ${formatCoins(amount)} coinlik hediye hazırlandı.`
    );
  };

  // VIP satın alma
  const buyVIP = (vipLevel) => {
    const selected = VIP_LEVELS.find((item) => item.id === vipLevel);

    if (!selected) return;

    if ((data.vipLevel || 0) >= vipLevel) {
      notify("👑 Bu VIP seviyesine zaten sahipsin!");
      return;
    }

    if (data.coins < selected.price) {
      notify(`❌ Bu VIP için ${formatCoins(selected.price)} coin gerekiyor.`);
      return;
    }

    setData((previous) => ({
      ...previous,
      coins: previous.coins - selected.price,
      vipLevel,
    }));

    notify(`👑 ${selected.name} satın alındı!`);
  };

  // SVIP satın alma
  const buySVIP = (svipLevel) => {
    const selected = SVIP_LEVELS.find((item) => item.id === svipLevel);

    if (!selected) return;

    if ((data.svipLevel || 0) >= svipLevel) {
      notify("💎 Bu SVIP seviyesine zaten sahipsin!");
      return;
    }

    if (data.coins < selected.price) {
      notify(`❌ Bu SVIP için ${formatCoins(selected.price)} coin gerekiyor.`);
      return;
    }

    setData((previous) => ({
      ...previous,
      coins: previous.coins - selected.price,
      svipLevel,
    }));

    notify(`💎 ${selected.name} satın alındı!`);
  };
  // Elmasla çerçeve satın al
  const buyFrame = (frame) => {
    if (data.ownedFrames.includes(frame.id)) {
      setData((previous) => ({
        ...previous,
        activeFrame: frame.id,
      }));

      notify(`🖼️ ${frame.name} kuşanıldı!`);
      return;
    }

    if (data.diamonds < frame.price) {
      notify(
        `💎 Bu çerçeve için ${frame.price} elmas gerekiyor.`
      );
      return;
    }

    setData((previous) => ({
      ...previous,
      diamonds: previous.diamonds - frame.price,
      ownedFrames: [...previous.ownedFrames, frame.id],
      activeFrame: frame.id,
    }));

    notify(`✅ ${frame.name} satın alındı ve kuşanıldı!`);
  };

  // Profil adını değiştir
  const saveProfileName = () => {
    const name = profileNameInput.trim();

    if (name.length < 2 || name.length > 20) {
      notify("⚠️ Kullanıcı adı 2-20 karakter arasında olmalı!");
      return;
    }

    setData((previous) => ({
      ...previous,
      profileName: name,
    }));

    setProfileNameInput("");
    notify("✅ Profil adı güncellendi!");
  };

  // Profil fotoğrafını değiştir
  const handleProfileImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("⚠️ Lütfen bir resim dosyası seç!");
      return;
    }

    if (file.size > 700 * 1024) {
      notify("⚠️ Fotoğraf en fazla 700 KB olmalı!");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setData((previous) => ({
        ...previous,
        profileImage: reader.result,
      }));

      notify("✅ Profil fotoğrafı güncellendi!");
    };

    reader.onerror = () => {
      notify("❌ Fotoğraf okunamadı!");
    };

    reader.readAsDataURL(file);
  };

  // Başarı rozetlerini kontrol et
  const unlockedAchievements = ACHIEVEMENTS.filter((achievement) => {
    switch (achievement.id) {
      case "lucky":
        return data.jackpotWins >= 1;

      case "generous":
        return data.giftedCoins >= 2000000;

      case "rich":
        return data.totalEarned >= 10000000;

      case "jackpot":
        return data.jackpotWins >= 5;

      case "legend":
        return data.gamesPlayed >= 100;

      case "vip":
        return data.vip >= 1;

      default:
        return false;
    }
  });

  // Slot geçmişini temizle
  const clearSlotHistory = () => {
    setData((previous) => ({
      ...previous,
      slotHistory: [],
    }));

    notify("🧹 Oyun geçmişi temizlendi.");
  };
  const statPillStyle = {
  background: "#242438",
  border: "1px solid #45455c",
  color: "#f5c542",
  borderRadius: 10,
  padding: "9px 12px",
  fontWeight: 800,
  fontSize: 13,
};
  // Oyuncunun coin ve elmas bakiyesini Supabase ile eşitle
useEffect(() => {
  if (!loaded || !user?.id) return;

  let cancelled = false;

  const syncBalance = async () => {
    const { data: balance, error } = await supabase
      .from("player_game_balances")
      .select("coins, diamonds, vip")
      .eq("user_id", user.id)
      .maybeSingle();

    if (cancelled) return;

    if (error) {
      console.error("Bakiye eşitleme hatası:", error.message);
      return;
    }

    if (balance) {
      setData((current) => ({
        ...current,
        coins: Number(balance.coins ?? current.coins),
        diamonds: Number(balance.diamonds ?? current.diamonds),
        vip: Number(balance.vip ?? current.vip),
        vipLevel: Number(balance.vip ?? current.vipLevel),
      }));
    }
  };

  syncBalance();

  return () => {
    cancelled = true;
  };
}, [loaded, user?.id]);
    // Menü seçenekleri
 const isAdmin =
  user?.email?.toLowerCase() === "erenyalcin1906@gmail.com";

const loadAdminPlayers = async () => {
  if (!isAdmin) {
    notify("⛔ Admin yetkisi gerekli.");
    return;
  }

  setAdminBusy(true);

  const { data: players, error } = await supabase.rpc(
    "admin_list_players"
  );

  setAdminBusy(false);

  if (error) {
    notify("❌ Oyuncular yüklenemedi: " + error.message);
    return;
  }

  setAdminPlayers(players || []);
  notify("✅ Oyuncu listesi yenilendi.");
};

const submitAdminAdjustment = async (event) => {
  event.preventDefault();

  if (!isAdmin) {
    notify("⛔ Admin yetkisi gerekli.");
    return;
  }

  if (!adminTargetEmail.trim()) {
    notify("⚠️ Oyuncunun e-posta adresini yaz.");
    return;
  }

  const coinChange = Number(adminCoinChange || 0);
  const diamondChange = Number(adminDiamondChange || 0);
  const vipLevel =
    adminVipLevel === "" ? null : Number(adminVipLevel);

  if (
    !Number.isSafeInteger(coinChange) ||
    !Number.isSafeInteger(diamondChange)
  ) {
    notify("⚠️ Coin ve elmas miktarı tam sayı olmalı.");
    return;
  }

  setAdminBusy(true);

  const { error } = await supabase.rpc("admin_adjust_player", {
    target_email: adminTargetEmail.trim(),
    coin_change: coinChange,
    diamond_change: diamondChange,
    vip_level: vipLevel,
  });

  setAdminBusy(false);

  if (error) {
    notify("❌ İşlem başarısız: " + error.message);
    return;
  }

  notify("✅ Oyuncu bilgileri güncellendi.");
  await loadAdminPlayers();
};

const renderAdminPanel = () => (
  <section style={{ ...panelStyle, marginTop: 16 }}>
    <h2 style={{ color: "#f5d36b" }}>
      🛡️ Admin Coins Paneli
    </h2>

    <p>Yetkili hesap: {user?.email}</p>

    <p style={{ color: "#aaa", fontSize: 13 }}>
      Eklemek için pozitif, azaltmak için negatif sayı gir.
    </p>

    <form
      onSubmit={submitAdminAdjustment}
      style={{ display: "grid", gap: 12 }}
    >
      <label>
        Oyuncunun e-posta adresi
        <input
          type="email"
          required
          value={adminTargetEmail}
          onChange={(event) =>
            setAdminTargetEmail(event.target.value)
          }
          placeholder="oyuncu@ornek.com"
          style={inputStyle}
        />
      </label>

      <label>
        💰 Coin miktarı (+ ekle / - azalt)
        <input
          type="number"
          step="1"
          value={adminCoinChange}
          onChange={(event) =>
            setAdminCoinChange(event.target.value)
          }
          style={inputStyle}
        />
      </label>

      <label>
        💎 Elmas miktarı (+ ekle / - azalt)
        <input
          type="number"
          step="1"
          value={adminDiamondChange}
          onChange={(event) =>
            setAdminDiamondChange(event.target.value)
          }
          style={inputStyle}
        />
      </label>

      <label>
        👑 VIP seviyesi
        <select
          value={adminVipLevel}
          onChange={(event) =>
            setAdminVipLevel(event.target.value)
          }
          style={inputStyle}
        >
          <option value="">VIP seviyesini değiştirme</option>
          <option value="0">VIP kaldır</option>
          <option value="1">VIP 1</option>
          <option value="2">VIP 2 / SVIP</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={adminBusy}
        style={buttonStyle}
      >
        {adminBusy ? "⏳ İşleniyor..." : "💰 Bakiyeyi Güncelle"}
      </button>

      <button
        type="button"
        disabled={adminBusy}
        onClick={loadAdminPlayers}
        style={smallButtonStyle}
      >
        🔄 Oyuncuları Listele
      </button>
    </form>

    <h3 style={{ color: "#f5d36b" }}>👥 Oyuncular</h3>

    {adminPlayers.length === 0 ? (
      <p>Oyuncuları görmek için listeleme düğmesine bas.</p>
    ) : (
      <div style={{ display: "grid", gap: 8 }}>
        {adminPlayers.map((player) => (
          <button
            key={player.user_id}
            type="button"
            onClick={() =>
              setAdminTargetEmail(player.email)
            }
            style={smallButtonStyle}
          >
            {player.email}
            {" — "}
            💰 {Number(player.coins).toLocaleString("tr-TR")}
            {" — "}
            💎 {Number(player.diamonds).toLocaleString("tr-TR")}
            {" — "}
            👑 VIP {player.vip}
          </button>
        ))}
      </div>
    )}
  </section>
);
  const menuItems = [
    { id: "home", label: "Ana Sayfa", icon: "🏠" },
    ...(isAdmin
  ? [{ id: "admin", label: "Admin Coins", icon: "🛡️" }]
  : []),
    { id: "slot", label: "Slot", icon: "🎰" },
    { id: "zeus", label: "Zeus Çarpanı", icon: "⚡" },
    { id: "wheel", label: "Dönme Dolap", icon: "🎡" },
    { id: "profile", label: "Profil", icon: "👤" },
    { id: "diamonds", label: "Elmas", icon: "💎" },
    { id: "daily", label: "Günlük Ödül", icon: "🎁" },
    { id: "gift", label: "Hediye", icon: "🎉" },
    { id: "vip", label: "VIP Market", icon: "👑" },
    { id: "svip", label: "SVIP Market", icon: "💎" },
    { id: "badges", label: "Rozetler", icon: "🏆" },
    { id: "history", label: "Oyun Geçmişi", icon: "📜" },
    { id: "login", label: "Giriş / Kayıt", icon: "🔐" },
  ];

  const activeFrameData = FRAMES.find(
    (frame) => frame.id === data.activeFrame
  );

  const cardStyle = {
    background: "linear-gradient(145deg, #1b1b2b, #11111c)",
    border: "1px solid #35354c",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  };

  const smallButtonStyle = {
    ...buttonStyle,
    padding: "9px 12px",
    fontSize: 13,
  };

  // Başlık ve üst bilgi paneli
  const renderHeader = () => (
    <header
      style={{
        textAlign: "center",
        padding: "22px 12px",
        borderBottom: "1px solid #343449",
        background:
          "linear-gradient(135deg, #191927 0%, #29203b 50%, #11111c 100%)",
        borderRadius: "0 0 20px 20px",
      }}
    >
      <div style={{ fontSize: 13, color: "#b9a6ff", letterSpacing: 4 }}>
        ROYAL GAMING EXPERIENCE
      </div>

      <h1
        style={{
          margin: "10px 0",
          fontSize: "clamp(28px, 7vw, 46px)",
          fontWeight: 900,
          letterSpacing: 2,
          background: "linear-gradient(90deg, #fff1a8, #f5c542, #e99b2e)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        👑 ROYAL SPIN
      </h1>

      <p style={{ color: "#b7b7ca", margin: 0 }}>
        Şansını dene, seviyeni yükselt!
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 20,
        }}
      >
        <div style={statPillStyle}>
          💰 {formatCoins(data.coins)}
        </div>

        <div style={statPillStyle}>
          💎 {formatCoins(data.diamonds)}
        </div>

        <div style={statPillStyle}>
          ⭐ Seviye {data.level}
        </div>

        <div style={statPillStyle}>
          👑 {data.vip === 2 ? "SVIP 2" : data.vip === 1 ? "SVIP 1" : "Standart"}
        </div>
      </div>

      <div
        style={{
          margin: "18px auto 0",
          maxWidth: 400,
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#c7c7d8",
            fontSize: 12,
            marginBottom: 6,
          }}
        >
          <span>XP İlerlemesi</span>
          <span>{data.xp % 1000}/1000 XP</span>
        </div>

        <div
          style={{
            height: 9,
            borderRadius: 20,
            background: "#343448",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${data.xp % 1000 / 10}%`,
              background: "linear-gradient(90deg, #9b5cff, #f5c542)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    </header>
  );

  // Menü
  const renderNavigation = () => (
    <nav
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 8,
        padding: "16px 4px",
      }}
    >
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setPage(item.id)}
          style={{
            background:
              page === item.id
                ? "linear-gradient(135deg, #f5c542, #e69b16)"
                : "#202033",
            color: page === item.id ? "#111" : "#eee",
            border:
              page === item.id
                ? "1px solid #ffe08a"
                : "1px solid #38384f",
            borderRadius: 10,
            padding: "10px 12px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </nav>
  );

  // Profil resmi ve kullanıcı bilgisi
  const renderMiniProfile = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        margin: "8px auto",
        padding: 12,
        maxWidth: 500,
        background: "#181827",
        border: "1px solid #303047",
        borderRadius: 14,
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: "50%",
          border: `3px solid ${activeFrameData?.color || "#f5c542"}`,
          overflow: "hidden",
          background: "#29293c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          flexShrink: 0,
        }}
      >
        {data.profileImage ? (
          <img
            src={data.profileImage}
            alt="Profil"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          "👤"
        )}
      </div>

      <div style={{ textAlign: "left", minWidth: 0 }}>
<div
  style={{
    color: isAdmin ? "#ffd700" : activeFrameData?.color || "#f5c542",
    fontWeight: 900,
    overflowWrap: "anywhere",
    fontSize: 17,
    background: isAdmin
      ? "linear-gradient(90deg, #fff0a6, #ffb700, #fff7cc, #e8a000)"
      : "transparent",
    backgroundClip: isAdmin ? "text" : "border-box",
    WebkitBackgroundClip: isAdmin ? "text" : "border-box",
    WebkitTextFillColor: isAdmin ? "transparent" : "inherit",
    textShadow: isAdmin ? "0 0 12px rgba(255,193,7,0.45)" : "none",
  }}
>
  {data.profileName}
  {isAdmin && (
    <span
      style={{
        marginLeft: 6,
        fontSize: 15,
        WebkitTextFillColor: "#ffd700",
      }}
    >
      ✨
    </span>
  )}
</div>

{isAdmin && (

  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      marginTop: 6,
      padding: "5px 9px",
      borderRadius: 20,
      background: "linear-gradient(135deg, #493300, #b8860b, #493300)",
      border: "1px solid #ffe08a",
      color: "#fff3b0",
      fontSize: 10,
      fontWeight: 900,
      letterSpacing: 0.5,
      boxShadow: "0 0 12px rgba(255,193,7,0.25)",
    }}
  >
    👑 ROYAL SPIN ADMİNİ
    <span style={{ color: "#8fffc0" }}>☑️</span>
  </div>
)}
  </div>
      </div> 
  );
  // Ana sayfa
  const renderHome = () => (
    <section style={panelStyle}>
      <div
        style={{
          textAlign: "center",
          padding: "18px 8px",
        }}
      >
        <div style={{ fontSize: 58 }}>🎰</div>

        <h2 style={{ color: "#f5c542", fontSize: 27 }}>
          Oyunun Patronu Sensin!
        </h2>

        <p style={{ color: "#c4c4d6", lineHeight: 1.7 }}>
          Royal Spin dünyasına hoş geldin. Slot oyna, XP kazan,
          seviyeni yükselt ve profilini kişiselleştir.
        </p>

        <button
          style={{
            ...buttonStyle,
            fontSize: 16,
            padding: "14px 24px",
            marginTop: 8,
          }}
          onClick={() => setPage("slot")}
        >
          🎰 SLOTA GİT
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 10,
          marginTop: 12,
        }}
      >
        {[
          ["🎮", "Oynanan Oyun", data.gamesPlayed],
          ["🏆", "Jackpot", data.jackpotWins],
          ["💰", "Toplam Kazanç", formatCoins(data.totalEarned)],
          ["🎁", "Hediye Edilen", formatCoins(data.giftedCoins)],
        ].map(([icon, title, value]) => (
          <div
            key={title}
            style={{
              ...cardStyle,
              marginBottom: 0,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 25 }}>{icon}</div>
            <div style={{ color: "#a9a9bd", fontSize: 12 }}>{title}</div>
            <div style={{ color: "#f5c542", fontSize: 19, fontWeight: 800 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: 16 }}>
        <h3 style={{ color: "#f5c542", marginTop: 0 }}>
          ⚡ Hızlı Erişim
        </h3>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button style={smallButtonStyle} onClick={() => setPage("slot")}>
            🎰 Slot Oyna
          </button>

          <button style={smallButtonStyle} onClick={() => setPage("daily")}>
            🎁 Günlük Ödül
          </button>

          <button style={smallButtonStyle} onClick={() => setPage("profile")}>
            👤 Profilim
          </button>

          <button style={smallButtonStyle} onClick={() => setPage("vip")}>
            👑 VIP Market
          </button>
        </div>
      </div>
    </section>
  );
  // Slot oyun ekranı
  const renderSlot = () => (
    <section style={panelStyle}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 15, color: "#b7a6ff", letterSpacing: 3 }}>
          ROYAL CASINO
        </div>

        <h2
          style={{
            color: "#f5c542",
            fontSize: 30,
            margin: "10px 0",
          }}
        >
          🎰 ROYAL SLOT
        </h2>

        <p style={{ color: "#bdbdd0" }}>
          Üç sembolü eşleştir, oyun içi coin kazan!
        </p>
      </div>

      {/* Bakiye */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 10,
          margin: "20px 0",
        }}
      >
        <div style={statPillStyle}>
          💰 Bakiye: {formatCoins(data.coins)}
        </div>

        <div style={statPillStyle}>
          💎 Elmas: {formatCoins(data.diamonds)}
        </div>

        <div style={statPillStyle}>
          ⭐ Seviye: {data.level}
        </div>
      </div>

      {/* Slot makaraları */}
      <div
        style={{
          background:
            "linear-gradient(145deg, #29213c, #11111c)",
          border: "2px solid #d9a927",
          borderRadius: 20,
          padding: "22px 10px",
          boxShadow: slotEffect
            ? "0 0 28px rgba(245,197,66,0.6)"
            : "0 0 12px rgba(245,197,66,0.12)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(5px, 3vw, 14px)",
          }}
        >
          {slotSymbols.map((symbol, index) => (
            <div
              key={index}
              style={{
                width: "clamp(75px, 22vw, 125px)",
                height: "clamp(85px, 24vw, 135px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(180deg, #fff7df, #e8d8ad)",
                border: "3px solid #c69a35",
                borderRadius: 14,
                fontSize: "clamp(35px, 10vw, 60px)",
                boxShadow: "inset 0 0 12px rgba(0,0,0,0.15)",
                transform: slotSpinning
                  ? "translateY(2px)"
                  : "translateY(0)",
                transition: "transform 0.15s ease",
              }}
            >
              {slotSpinning
                ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
                : symbol}
            </div>
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            color: "#f5c542",
            marginTop: 18,
            fontSize: 13,
          }}
        >
          {slotSpinning ? "🎰 MAKARALAR DÖNÜYOR..." : "✨ ŞANSINI DENE ✨"}
        </div>
      </div>

      {/* Bahis seçimi */}
      <div style={{ ...cardStyle, marginTop: 20 }}>
        <h3 style={{ color: "#f5c542", marginTop: 0 }}>
          💰 Bahis Miktarı
        </h3>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {[100, 500, 1000, 5000, 10000].map((amount) => (
            <button
              key={amount}
              onClick={() => changeBet(amount)}
              style={{
                ...smallButtonStyle,
                background:
                  slotBet === amount
                    ? "linear-gradient(135deg, #f5c542, #e69b16)"
                    : "#29293d",
                color: slotBet === amount ? "#111" : "#fff",
                border:
                  slotBet === amount
                    ? "1px solid #ffe08a"
                    : "1px solid #45455c",
              }}
              disabled={slotSpinning}
            >
              {formatCoins(amount)}
            </button>
          ))}
        </div>

        <label
          style={{
            display: "block",
            color: "#c7c7d8",
            marginTop: 16,
            fontSize: 13,
          }}
        >
          Özel bahis miktarı
        </label>

        <input
          type="number"
          min="100"
          max="1000000"
          step="100"
          value={customBet}
          onChange={(event) => setCustomBet(event.target.value)}
          style={inputStyle}
          disabled={slotSpinning}
        />

        <button
          style={{
            ...buttonStyle,
            width: "100%",
            marginTop: 8,
            opacity: slotSpinning ? 0.6 : 1,
          }}
          disabled={slotSpinning}
          onClick={() => {
            const amount = Number(customBet);

            if (
              !Number.isFinite(amount) ||
              amount < 100 ||
              amount > 1000000
            ) {
              setSlotMessage("⚠️ Bahis 100 ile 1.000.000 arasında olmalı!");
              return;
            }

            changeBet(amount);
          }}
        >
          ✅ Bahsi Uygula
        </button>

        <p
          style={{
            textAlign: "center",
            color: "#a9a9bd",
            fontSize: 12,
          }}
        >
          Seçili bahis: {formatCoins(slotBet)} coin
        </p>
      </div>

      {/* Oyun kontrolleri */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 10,
          marginTop: 18,
        }}
      >
        <button
          onClick={playSlot}
          disabled={slotSpinning || autoSpin}
          style={{
            ...buttonStyle,
            padding: 16,
            fontSize: 16,
            opacity: slotSpinning || autoSpin ? 0.5 : 1,
          }}
        >
          {slotSpinning ? "⏳ DÖNÜYOR..." : "🎰 ÇEVİR"}
        </button>

        <button
          onClick={() => setFastSpin((previous) => !previous)}
          style={{
            ...buttonStyle,
            background: fastSpin ? "#8b5cf6" : "#29293d",
            color: "#fff",
            border: "1px solid #555",
          }}
        >
          ⚡ Hızlı: {fastSpin ? "AÇIK" : "KAPALI"}
        </button>

        <button
          onClick={() => setSoundEnabled((previous) => !previous)}
          style={{
            ...buttonStyle,
            background: soundEnabled ? "#16845b" : "#29293d",
            color: "#fff",
            border: "1px solid #555",
          }}
        >
          {soundEnabled ? "🔊 Ses Açık" : "🔇 Ses Kapalı"}
        </button>
      </div>

      {/* Otomatik çevirme */}
      <div style={{ ...cardStyle, marginTop: 18 }}>
        <h3 style={{ color: "#f5c542", marginTop: 0 }}>
          🔄 Otomatik Çevirme
        </h3>

        <p style={{ color: "#bdbdd0", fontSize: 13 }}>
          Kaç kez otomatik çevirmek istediğini seç.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {[10, 25, 50].map((count) => (
            <button
              key={count}
              onClick={() => setAutoSpinCount(count)}
              style={{
                ...smallButtonStyle,
                background:
                  autoSpinCount === count ? "#f5c542" : "#29293d",
                color: autoSpinCount === count ? "#111" : "#fff",
              }}
              disabled={autoSpin || slotSpinning}
            >
              {count} Oyun
            </button>
          ))}
        </div>

        {!autoSpin ? (
          <button
            onClick={startAutoSpin}
            disabled={slotSpinning}
            style={{
              ...buttonStyle,
              width: "100%",
              marginTop: 14,
              opacity: slotSpinning ? 0.5 : 1,
            }}
          >
            🔄 Otomatik Oyunu Başlat
          </button>
        ) : (
          <button
            onClick={stopAutoSpin}
            style={{
              ...buttonStyle,
              width: "100%",
              marginTop: 14,
              background: "#d94848",
              color: "#fff",
            }}
          >
            ⏹️ Durdur · Kalan: {autoRemaining}
          </button>
        )}
      </div>

      {/* Sonuç mesajı */}
      {slotMessage && (
        <div
          role="status"
          style={{
            background: "#252238",
            border: "1px solid #69558f",
            color: "#ffe9a6",
            borderRadius: 12,
            padding: 16,
            marginTop: 18,
            textAlign: "center",
            fontWeight: 700,
            overflowWrap: "anywhere",
          }}
        >
          {slotMessage}
        </div>
      )}

      {/* Kazanç tablosu */}
      <div style={{ ...cardStyle, marginTop: 20 }}>
        <h3 style={{ color: "#f5c542", marginTop: 0 }}>
          🏆 Ödül Tablosu
        </h3>

        {[
          ["👑 👑 👑", "Kraliyet Jackpot", "100x bahis"],
          ["7️⃣ 7️⃣ 7️⃣", "Jackpot", "50x bahis"],
          ["Üç aynı sembol", "Üçlü eşleşme", "10x bahis"],
          ["İki aynı sembol", "İkili eşleşme", "2x bahis"],
        ].map(([symbols, title, reward]) => (
          <div
            key={title}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              padding: "12px 0",
              borderBottom: "1px solid #343449",
              fontSize: 13,
            }}
          >
            <span>{symbols}</span>
            <span style={{ color: "#d5d5e6" }}>{title}</span>
            <strong style={{ color: "#f5c542" }}>{reward}</strong>
          </div>
        ))}

        <p style={{ color: "#9999af", fontSize: 11, lineHeight: 1.6 }}>
          Bu tablo oyun içi sanal coin ödüllerini gösterir.
          Coinler gerçek para değildir ve nakde çevrilemez.
        </p>
      </div>

      {/* Son oyunlar */}
      <div style={{ ...cardStyle, marginTop: 18 }}>
        <h3 style={{ color: "#f5c542", marginTop: 0 }}>
          📜 Son Oyunlar
        </h3>

        {data.slotHistory.length === 0 ? (
          <p style={{ color: "#a9a9bd", textAlign: "center" }}>
            Henüz oyun geçmişin yok. İlk slot oyununu oyna!
          </p>
        ) : (
          data.slotHistory.slice(0, 5).map((item, index) => (
            <div
              key={`${item.date}-${index}`}
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
              <span>{item.symbols.join(" ")}</span>

              <span style={{ color: "#a9a9bd" }}>
                Bahis: {formatCoins(item.bet)}
              </span>

              <strong
                style={{
                  color: item.payout > 0 ? "#65e6a1" : "#ff8585",
                }}
              >
                {item.payout > 0
                  ? `+${formatCoins(item.payout)}`
                  : "Kazanç yok"}
              </strong>
            </div>
          ))
        )}

        {data.slotHistory.length > 0 && (
          <button
            onClick={clearSlotHistory}
            style={{
              ...smallButtonStyle,
              marginTop: 12,
              background: "#29293d",
              color: "#fff",
            }}
          >
            🧹 Geçmişi Temizle
          </button>
        )}
      </div>
    </section>
  );
// DÖNME DOLAP OYUNU
// ZEUS ÇARPANI OYUN MOTORU
const playZeus = () => {
  if (zeusSpinning) return;

  const freeSpin = zeusFreeSpins > 0;

  if (!freeSpin && data.coins < zeusBet) {
    setZeusMessage("❌ Yeterli coin yok!");
    return;
  }

  setZeusSpinning(true);

  if (freeSpin) {
    setZeusFreeSpins((n) => n - 1);
  } else {
    setData((prev) => ({
      ...prev,
      coins: prev.coins - zeusBet,
    }));
  }

  const symbols = ["💎", "🔴", "🟣", "🟢", "🟡", "👑", "⚡"];
  const grid = Array.from({ length: 30 }, () =>
    symbols[Math.floor(Math.random() * symbols.length)]
  );

  let kazanc = 0;
  let carpan = 0;

  const counts = {};

  grid.forEach((symbol) => {
    counts[symbol] = (counts[symbol] || 0) + 1;
  });

  Object.entries(counts).forEach(([symbol, count]) => {
    if (count >= 8) {
      const oran = count >= 15 ? 3 : count >= 12 ? 2 : 1;

      kazanc += Math.floor(zeusBet * oran);

      if (Math.random() < 0.35) {
        const carpanlar = [2, 3, 5, 10, 25, 50, 100];

        carpan +=
          carpanlar[Math.floor(Math.random() * carpanlar.length)];
      }
    }
  });

  if (kazanc > 0 && carpan > 0) {
    kazanc *= carpan;
  }

  setZeusGrid(grid);

  if (Math.random() < 0.03) {
    setZeusFreeSpins((n) => n + 5);
    setZeusMessage("🎁 5 ÜCRETSİZ DÖNÜŞ KAZANDIN!");
  } else if (kazanc > 0) {
    setData((prev) => ({
      ...prev,
      coins: prev.coins + kazanc,
      totalEarned: (prev.totalEarned || 0) + kazanc,
      gamesPlayed: (prev.gamesPlayed || 0) + 1,
    }));

    setZeusMessage(
      "⚡ " + (carpan > 0 ? "×" + carpan + " ÇARPAN! " : "") +
      "🪙 " + kazanc.toLocaleString("tr-TR") + " COIN KAZANDIN!"
    );
  } else {
    setData((prev) => ({
      ...prev,
      gamesPlayed: (prev.gamesPlayed || 0) + 1,
    }));

    setZeusMessage("🌩️ Bu tur kazanç yok. Tekrar dene!");
  }

  setTimeout(() => setZeusSpinning(false), 700);
};
  // ZEUS ÇARPANI OYUN EKRANI
  const renderZeus = () => (
    <div style={{
      minHeight: "100vh",
      padding: "20px",
      color: "#fff",
      background: "linear-gradient(180deg, #160b35, #070711)",
      textAlign: "center",
      borderRadius: "18px"
    }}>
      <h1 style={{
        color: "#ffd700",
        fontSize: "30px",
        textShadow: "0 0 15px #ff9900"
      }}>
        ⚡ ZEUS ÇARPANI ⚡
      </h1>

      <p style={{ color: "#ddd" }}>
        Zeus'un gücünü dene, çarpanları yakala!
      </p>

      <div style={{
        background: "linear-gradient(135deg, #38205f, #171126)",
        border: "2px solid #d6aaff",
        borderRadius: "15px",
        padding: "15px",
        margin: "15px 0"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: "6px"
        }}>
          {zeusGrid.map((symbol, index) => (
            <div key={index} style={{
              background: "linear-gradient(145deg, #35245b, #171024)",
              border: "1px solid #a77cff",
              borderRadius: "8px",
              minHeight: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(18px, 5vw, 28px)",
              boxShadow: "0 0 8px #6f35aa"
            }}>
              {symbol}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: "#21133c",
        border: "1px solid #ffd700",
        borderRadius: "12px",
        padding: "12px",
        marginBottom: "15px"
      }}>
        <div>🪙 Bakiye: {Number(data.coins || 0).toLocaleString("tr-TR")} coin</div>
        <div style={{ marginTop: "8px", color: "#ffd700" }}>
          🎁 Ücretsiz dönüş: {zeusFreeSpins}
        </div>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <p>Bahis miktarını seç:</p>

        {[100, 250, 500, 1000].map((amount) => (
          <button
            key={amount}
            onClick={() => setZeusBet(amount)}
            disabled={zeusSpinning}
            style={{
              margin: "4px",
              padding: "10px 12px",
              borderRadius: "8px",
              border: zeusBet === amount
                ? "2px solid #ffd700"
                : "1px solid #8064b4",
              background: zeusBet === amount ? "#6740a0" : "#21133c",
              color: "#fff",
              fontWeight: "bold"
            }}
          >
            {amount.toLocaleString("tr-TR")}
          </button>
        ))}
      </div>

      <div style={{
        color: "#ffd700",
        fontWeight: "bold",
        minHeight: "45px",
        margin: "12px 0"
      }}>
        {zeusMessage}
      </div>

      <button
        onClick={playZeus}
        disabled={zeusSpinning}
        style={{
          width: "100%",
          maxWidth: "320px",
          padding: "16px",
          borderRadius: "12px",
          border: "2px solid #ffe66d",
          background: zeusSpinning
            ? "#555"
            : "linear-gradient(90deg, #a45b00, #ffd700, #a45b00)",
          color: "#160b20",
          fontSize: "20px",
          fontWeight: "bold",
          cursor: zeusSpinning ? "not-allowed" : "pointer",
          boxShadow: "0 0 18px #c98c25"
        }}
      >
        {zeusSpinning ? "⚡ DÖNÜYOR..." : "⚡ OYNA"}
      </button>

      <div style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "8px",
        marginTop: "18px"
      }}>
        {["×2", "×3", "×5", "×10", "×25", "×50", "×100"].map((multiplier) => (
          <span key={multiplier} style={{
            background: "#38205f",
            border: "1px solid #ffd700",
            color: "#ffd700",
            padding: "7px 10px",
            borderRadius: "8px",
            fontWeight: "bold"
          }}>
            {multiplier}
          </span>
        ))}
      </div>
    </div>
  );
const renderWheel = () => (
  <section style={panelStyle}>
    <h2 style={{ color: "#f5c542", textAlign: "center" }}>
      🎡 DÖNME DOLAP
    </h2>

    <p style={{ textAlign: "center", color: "#fff" }}>
      Bakiyen: 🪙 {formatCoins(data.coins)}
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
        margin: "20px 0",
      }}
    >
      {[45, 5, 10, 15, 25, 20, 1000, 1].map((multiplier) => (
        <div
          key={multiplier}
          style={{
            padding: "18px 4px",
            textAlign: "center",
            borderRadius: 12,
            background: "linear-gradient(145deg, #29203b, #11111c)",
            border: "1px solid #f5c542",
            color: "#f5c542",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          {multiplier}x
        </div>
      ))}
    </div>

    <label style={{ color: "#fff" }}>Bahis miktarı:</label>

    <input
      type="number"
      min="1"
      max="1000000000"
      value={wheelBet}
      disabled={wheelSpinning}
      onChange={(e) => {
        const value = Number(e.target.value);
        setWheelBet(
          Math.max(1, Math.min(1000000000, value || 1))
        );
      }}
      style={inputStyle}
    />

    <p style={{ color: "#aaaabc", textAlign: "center" }}>
      En yüksek bahis: 1.000.000.000 coin
    </p>

    <button
      disabled={wheelSpinning || data.coins < wheelBet}
      onClick={() => {
        if (wheelSpinning || data.coins < wheelBet) return;

        setWheelSpinning(true);
        setWheelResult(null);
        setWheelMessage("🎡 Çark dönüyor...");

        setData((prev) => ({
          ...prev,
          coins: prev.coins - wheelBet,
          gamesPlayed: prev.gamesPlayed + 1,
        }));

        setTimeout(() => {
          const multipliers = [45, 5, 10, 15, 25, 20, 1000, 1];
          const multiplier =
            multipliers[Math.floor(Math.random() * multipliers.length)];

          const payout = wheelBet * multiplier;

          setData((prev) => ({
            ...prev,
            coins: prev.coins + payout,
            totalEarned: prev.totalEarned + payout,
            jackpotWins:
              prev.jackpotWins + (multiplier === 1000 ? 1 : 0),
            xp: prev.xp + 25,
            level: Math.floor((prev.xp + 25) / 1000) + 1,
          }));

          setWheelResult(multiplier);
          setWheelMessage(
            `🎉 ${multiplier}x kazandın! Ödül: ${formatCoins(payout)} coin`
          );
          setWheelSpinning(false);

          const entry = {
            win: payout,
            multiplier,
            date: new Date().toLocaleString("tr-TR"),
          };

          setWheelLeaderboard((prev) => {
            const updated = [entry, ...prev]
              .sort((a, b) => b.win - a.win)
              .slice(0, 10);

            try {
              localStorage.setItem(
                "royal-spin-wheel-leaderboard",
                JSON.stringify(updated)
              );
            } catch (error) {
              console.error("Liderlik listesi kaydedilemedi", error);
            }

            return updated;
          });
        }, 1500);
      }}
      style={{
        ...buttonStyle,
        display: "block",
        width: "100%",
        fontSize: 18,
        padding: 16,
        opacity: wheelSpinning || data.coins < wheelBet ? 0.5 : 1,
      }}
    >
      {wheelSpinning ? "🎡 DÖNÜYOR..." : "🎡 ÇARKI ÇEVİR"}
    </button>

    {wheelMessage && (
      <h3 style={{ color: "#f5c542", textAlign: "center" }}>
        {wheelMessage}
      </h3>
    )}

    {wheelResult !== null && (
      <p style={{ color: "#65e6a1", textAlign: "center" }}>
        Sonuç: {wheelResult}x
      </p>
    )}

    <div style={{ ...cardStyle, marginTop: 20 }}>
      <h3 style={{ color: "#f5c542" }}>🏆 En Çok Kazananlar</h3>

      {wheelLeaderboard.length === 0 ? (
        <p style={{ color: "#aaaabc" }}>
          Henüz kazanan yok. İlk kazanan sen ol!
        </p>
      ) : (
        wheelLeaderboard.map((player, index) => (
          <div
            key={`${player.date}-${index}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              padding: "10px 0",
              borderBottom: "1px solid #35354c",
              color: "#fff",
            }}
          >
            <span>
              {index + 1}. {player.multiplier}x
            </span>
            <strong style={{ color: "#f5c542" }}>
              {formatCoins(player.win)} coin
            </strong>
          </div>
        ))
      )}
    </div>
  </section>
);
  // Profil ekranı
  const renderProfile = () => (
    <section style={panelStyle}>
      <h2 style={{ color: "#f5c542", textAlign: "center" }}>
        👤 PROFİLİM
      </h2>

      {renderMiniProfile()}

      <div style={cardStyle}>
        <h3 style={{ color: "#f5c542" }}>📸 Profil Fotoğrafı</h3>

        <p style={{ color: "#aaaabc", fontSize: 13 }}>
          JPG, PNG veya başka bir resim formatı seçebilirsin.
          Dosya boyutu en fazla 700 KB olmalıdır.
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={handleProfileImage}
          style={{
            ...inputStyle,
            padding: 8,
          }}
        />

        {data.profileImage && (
          <button
            style={{
              ...smallButtonStyle,
              background: "#3a2630",
              color: "#ffaaaa",
            }}
            onClick={() => {
              setData((previous) => ({
                ...previous,
                profileImage: "",
              }));
              notify("Profil fotoğrafı kaldırıldı.");
            }}
          >
            🗑️ Fotoğrafı Kaldır
          </button>
        )}
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: "#f5c542" }}>✏️ Kullanıcı Adı</h3>

        <input
          type="text"
          maxLength={20}
          value={profileNameInput}
          onChange={(event) => setProfileNameInput(event.target.value)}
          placeholder="Yeni kullanıcı adın"
          style={inputStyle}
        />

        <button
          onClick={saveProfileName}
          style={{ ...buttonStyle, width: "100%" }}
        >
          ✅ İsmi Kaydet
        </button>
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: "#f5c542" }}>📊 İstatistikler</h3>

        {[
          ["💰 Coin Bakiyesi", formatCoins(data.coins)],
          ["💎 Elmas Bakiyesi", formatCoins(data.diamonds)],
          ["⭐ XP", formatCoins(data.xp)],
          ["🏅 Seviye", data.level],
          ["🎮 Oynanan Oyun", data.gamesPlayed],
          ["👑 Jackpot Sayısı", data.jackpotWins],
          ["🎁 Hediye Edilen Coin", formatCoins(data.giftedCoins)],
          ["🏆 Açılan Rozet", unlockedAchievements.length],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              padding: "12px 0",
              borderBottom: "1px solid #303047",
              color: "#ddd",
            }}
          >
            <span>{label}</span>
            <strong style={{ color: "#f5c542" }}>{value}</strong>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: "#f5c542" }}>🔐 Hesap Durumu</h3>

        {user ? (
          <>
            <p style={{ color: "#9fdfb1", overflowWrap: "anywhere" }}>
              ✅ Giriş yapıldı: {user.email}
            </p>

            <button
              onClick={handleLogout}
              style={{
                ...buttonStyle,
                background: "#b93838",
                color: "#fff",
              }}
            >
              🚪 Çıkış Yap
            </button>
          </>
        ) : (
          <>
            <p style={{ color: "#aaaabc" }}>
              Henüz bir Supabase hesabıyla giriş yapmadın.
            </p>

            <button
              style={buttonStyle}
              onClick={() => setPage("login")}
            >
              🔐 Giriş / Kayıt
            </button>
          </>
        )}
      </div>
    </section>
  );

  // Elmas mağazası
  const renderDiamonds = () => (
    <section style={panelStyle}>
      <h2 style={{ color: "#62d5ff", textAlign: "center" }}>
        💎 ELMAS MAĞAZASI
      </h2>

      <div style={{ ...cardStyle, textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>💎</div>

        <h3 style={{ color: "#62d5ff" }}>
          Elmas Bakiyen
        </h3>

        <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>
          {formatCoins(data.diamonds)}
        </div>

        <p style={{ color: "#aaaabc", fontSize: 13 }}>
          Elmaslarını profil çerçevelerini açmak için kullanabilirsin.
        </p>
      </div>

      <h3 style={{ color: "#f5c542" }}>🖼️ Profil Çerçeveleri</h3>

      {FRAMES.map((frame) => {
        const owned = data.ownedFrames.includes(frame.id);
        const active = data.activeFrame === frame.id;

        return (
          <div
            key={frame.id}
            style={{
              ...cardStyle,
              border: `1px solid ${frame.color}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 62,
                  height: 62,
                  flexShrink: 0,
                  borderRadius: "50%",
                  border: `4px solid ${frame.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                }}
              >
                {frame.icon}
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 6px", color: frame.color }}>
                  {frame.name}
                </h4>

                <p style={{ margin: 0, color: "#aaaabc", fontSize: 13 }}>
                  {frame.price} elmas
                </p>
              </div>
            </div>

            <button
              style={{
                ...buttonStyle,
                width: "100%",
                marginTop: 14,
                background: active ? "#27875a" : undefined,
                color: active ? "#fff" : "#111",
              }}
              onClick={() => buyFrame(frame)}
            >
              {active
                ? "✅ Kullanılıyor"
                : owned
                  ? "🖼️ Çerçeveyi Kuşan"
                  : "💎 Satın Al"}
            </button>
          </div>
        );
      })}
    </section>
  );

  // Günlük ödül ekranı
  const renderDaily = () => {
    const claimedToday = data.dailyClaimDate === dateKey();

    const nextStreak =
      data.dailyClaimDate === yesterdayKey()
        ? data.dailyStreak + 1
        : 1;

    const nextReward = Math.min(
      500 + (nextStreak - 1) * 100,
      2000
    );

    return (
      <section style={panelStyle}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 60 }}>🎁</div>

          <h2 style={{ color: "#f5c542" }}>
            GÜNLÜK ÖDÜL
          </h2>

          <p style={{ color: "#aaaabc" }}>
            Her gün giriş yap, sanal coin ödülünü al!
          </p>
        </div>

        <div
          style={{
            ...cardStyle,
            textAlign: "center",
            border: "1px solid #b99532",
          }}
        >
          <div style={{ fontSize: 42 }}>💰</div>

          <h3 style={{ color: "#f5c542" }}>
            {formatCoins(nextReward)} Coin
          </h3>

          <p style={{ color: "#aaaabc" }}>
            Günlük seri: {nextStreak}. gün
          </p>

          <button
            onClick={claimDailyReward}
            disabled={claimedToday}
            style={{
              ...buttonStyle,
              width: "100%",
              opacity: claimedToday ? 0.5 : 1,
            }}
          >
            {claimedToday
              ? "✅ Bugünkü Ödül Alındı"
              : "🎁 ÖDÜLÜMÜ AL"}
          </button>
        </div>

        <div style={cardStyle}>
          <h3 style={{ color: "#f5c542" }}>
            📅 Günlük Ödül Bilgisi
          </h3>

          <p style={{ color: "#ccc", lineHeight: 1.8 }}>
            🔹 İlk gün: 500 coin
            <br />
            🔹 Her ardışık günde: 100 coin ek ödül
            <br />
            🔹 Günlük maksimum ödül: 2.000 coin
            <br />
            🔹 Bir gün kaçırırsan seri yeniden başlar.
          </p>
        </div>
      </section>
    );
  };

  // Hediye ekranı
  const renderGift = () => (
    <section style={panelStyle}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56 }}>🎁</div>

        <h2 style={{ color: "#f5c542" }}>
          HEDİYE MERKEZİ
        </h2>

        <p style={{ color: "#aaaabc" }}>
          Oyun içi coin bakiyeni yönet.
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: "#f5c542" }}>💰 Coin Bakiyen</h3>

        <div style={{ fontSize: 28, color: "#fff", fontWeight: 900 }}>
          {formatCoins(data.coins)}
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: "#f5c542" }}>
          🎉 Hediye Hazırla
        </h3>

        <label style={{ color: "#ccc", fontSize: 13 }}>
          Alıcının oyuncu adı
        </label>

        <input
          type="text"
          value={giftRecipient}
          onChange={(event) => setGiftRecipient(event.target.value)}
          placeholder="Oyuncu adı"
          style={inputStyle}
        />

        <label style={{ color: "#ccc", fontSize: 13 }}>
          Hediye coin miktarı
        </label>

        <input
          type="number"
          min="1"
          value={giftAmount}
          onChange={(event) => setGiftAmount(event.target.value)}
          style={inputStyle}
        />

        <button
          onClick={sendGift}
          style={{ ...buttonStyle, width: "100%" }}
        >
          🎁 Hediyeyi Hazırla
        </button>

        <p style={{ color: "#9999af", fontSize: 12, lineHeight: 1.6 }}>
          Bu özellik şimdilik yalnızca kendi oyun bakiyende işlem yapar.
          Gerçek bir başka oyuncunun hesabına coin aktarmaz.
        </p>
      </div>

      <div style={cardStyle}>
        <h3 style={{ color: "#f5c542" }}>
          📊 Hediye İstatistiği
        </h3>

        <p style={{ color: "#ccc" }}>
          Toplam hediye edilen:{" "}
          <strong style={{ color: "#f5c542" }}>
            {formatCoins(data.giftedCoins)} coin
          </strong>
        </p>
      </div>
    </section>
  );
  // VIP marketi
  const renderVIP = () => (
    <section style={panelStyle}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 58 }}>👑</div>

        <h2 style={{ color: "#f5c542" }}>
          ROYAL VIP MARKET
        </h2>

        <p style={{ color: "#aaaabc" }}>
          Oyun içi coinlerinle VIP seviyeni yükselt.
        </p>

        <div style={statPillStyle}>
          💰 Bakiyen: {formatCoins(data.coins)} coin
        </div>
      </div>

      {VIP_LEVELS.map((item) => {
        const owned = (data.vipLevel || 0) >= item.id;

        return (
          <div
            key={item.id}
            style={{
              ...cardStyle,
              border: `1px solid ${item.id === 2 ? "#c084fc" : "#f5c542"}`,
              background:
                item.id === 2
                  ? "linear-gradient(145deg, #30203e, #171322)"
                  : "linear-gradient(145deg, #302b1d, #17151b)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48 }}>
                {item.id === 2 ? "💎" : "👑"}
              </div>

              <h3
                style={{
                  color: item.id === 2 ? "#d8a8ff" : "#f5c542",
                  fontSize: 26,
                  margin: "8px 0",
                }}
              >
                {item.name}
              </h3>

              <div
                style={{
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                {formatCoins(item.price)} Coin
              </div>
            </div>

            <div style={{ margin: "20px 0" }}>
              {item.features.map((feature) => (
                <div
                  key={feature}
                  style={{
                    padding: "10px 0",
                    color: "#ddd",
                    borderBottom: "1px solid #393345",
                  }}
                >
                  {feature}
                </div>
              ))}
            </div>

            <button
              onClick={() => buyVIP(item.id)}
              disabled={owned}
              style={{
                ...buttonStyle,
                width: "100%",
                background: owned
                  ? "#26734d"
                  : item.id === 2
                    ? "linear-gradient(135deg, #d8a8ff, #9055cf)"
                    : undefined,
                color: owned || item.id === 2 ? "#fff" : "#111",
                opacity: owned ? 0.8 : 1,
              }}
            >
              {owned
                ? "✅ SAHİPSİN"
                : `👑 ${item.name} SATIN AL`}
            </button>
          </div>
        );
      })}

      <p style={{ color: "#9999af", fontSize: 12, lineHeight: 1.7 }}>
        VIP özellikleri bu sürümde oyun içi simülasyondur.
        Satın alma işlemleri yalnızca sanal coin bakiyesini değiştirir.
      </p>
    </section>
  );
   // SVIP marketi
  const renderSVIP = () => (
    <section style={panelStyle}>
      <h2 style={{ color: "#d8a8ff", textAlign: "center" }}>
        💎 ROYAL SVIP MARKET
      </h2>

      <p style={{ color: "#fff", textAlign: "center" }}>
        Bakiyen: {formatCoins(data.coins)} coin
      </p>

      {SVIP_LEVELS.map((item) => {
        const owned = (data.svipLevel || 0) >= item.id;

        return (
          <div key={item.id} style={cardStyle}>
            <h3 style={{ color: "#d8a8ff", textAlign: "center" }}>
              👑 {item.name}
            </h3>

            <h3 style={{ color: "#fff", textAlign: "center" }}>
              {formatCoins(item.price)} Coin
            </h3>

            {item.features.map((feature) => (
              <p key={feature} style={{ color: "#ddd" }}>
                {feature}
              </p>
            ))}

            <button
              onClick={() => buySVIP(item.id)}
              disabled={owned}
              style={{ ...buttonStyle, width: "100%" }}
            >
              {owned ? "✅ SAHİPSİN" : `${item.name} SATIN AL`}
            </button>
          </div>
        );
      })}
    </section>
  );
  // Başarı rozetleri
  const renderBadges = () => (
    <section style={panelStyle}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 58 }}>🏆</div>

        <h2 style={{ color: "#f5c542" }}>
          BAŞARI ROZETLERİ
        </h2>

        <p style={{ color: "#aaaabc" }}>
          Oyna, ilerle ve başarılarını aç!
        </p>

        <div style={statPillStyle}>
          Açılan rozet: {unlockedAchievements.length}/
          {ACHIEVEMENTS.length}
        </div>
      </div>

      <div
        style={{
          height: 10,
          background: "#303047",
          borderRadius: 20,
          overflow: "hidden",
          margin: "20px 0",
        }}
      >
        <div
          style={{
            width: `${
              (unlockedAchievements.length / ACHIEVEMENTS.length) * 100
            }%`,
            height: "100%",
            background: "linear-gradient(90deg, #f5c542, #e68a22)",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {ACHIEVEMENTS.map((achievement) => {
        const unlocked = unlockedAchievements.some(
          (item) => item.id === achievement.id
        );

        return (
          <div
            key={achievement.id}
            style={{
              ...cardStyle,
              display: "flex",
              alignItems: "center",
              gap: 14,
              border: unlocked
                ? "1px solid #d9b43e"
                : "1px solid #35354a",
              opacity: unlocked ? 1 : 0.65,
            }}
          >
            <div
              style={{
                fontSize: 36,
                width: 54,
                height: 54,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#252538",
                borderRadius: 12,
                flexShrink: 0,
              }}
            >
              {unlocked ? achievement.icon : "🔒"}
            </div>

            <div style={{ flex: 1 }}>
              <h3
                style={{
                  color: unlocked ? "#f5c542" : "#c1c1d0",
                  margin: "0 0 6px",
                }}
              >
                {achievement.name}
              </h3>

              <p
                style={{
                  color: "#aaaabc",
                  fontSize: 13,
                  margin: 0,
                }}
              >
                {achievement.description}
              </p>
            </div>

            <div
              style={{
                fontSize: 12,
                color: unlocked ? "#7ee5a4" : "#9999af",
              }}
            >
              {unlocked ? "AÇILDI" : "KİLİTLİ"}
            </div>
          </div>
        );
      })}
    </section>
  );

  // Giriş, kayıt ve şifre yenileme ekranı
  const renderLogin = () => (
    <section style={panelStyle}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 58 }}>🔐</div>

        <h2 style={{ color: "#f5c542" }}>
          ROYAL SPIN HESABI
        </h2>

        <p style={{ color: "#aaaabc" }}>
          Hesabına giriş yap veya yeni hesap oluştur.
        </p>
      </div>

      {user ? (
        <div style={{ ...cardStyle, textAlign: "center" }}>
          <div style={{ fontSize: 42 }}>✅</div>

          <h3 style={{ color: "#7ee5a4" }}>
            Giriş Yapıldı
          </h3>

          <p
            style={{
              color: "#ccc",
              overflowWrap: "anywhere",
            }}
          >
            {user.email}
          </p>

          <button
            onClick={handleLogout}
            style={{
              ...buttonStyle,
              background: "#b93838",
              color: "#fff",
            }}
          >
            🚪 Çıkış Yap
          </button>
        </div>
      ) : (
        <div style={cardStyle}>
          <label style={{ color: "#ddd", fontSize: 13 }}>
            E-posta adresi
          </label>

          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ornek@email.com"
            style={inputStyle}
          />

          {!recoveryMode && (
            <>
              <label style={{ color: "#ddd", fontSize: 13 }}>
                Şifre
              </label>

              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="En az 6 karakter"
                style={inputStyle}
              />
            </>
          )}

          {recoveryMode ? (
            <>
              <button
                onClick={handlePasswordRecovery}
                disabled={authBusy}
                style={{ ...buttonStyle, width: "100%", marginBottom: 10 }}
              >
                {authBusy
                  ? "⏳ Gönderiliyor..."
                  : "📩 Şifre Yenileme E-postası Gönder"}
              </button>

              <label style={{ color: "#ddd", fontSize: 13 }}>
                Yeni şifre
              </label>

              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Yeni şifre"
                style={inputStyle}
              />

              <button
                onClick={handleNewPassword}
                disabled={authBusy}
                style={{ ...buttonStyle, width: "100%" }}
              >
                🔑 Yeni Şifreyi Kaydet
              </button>

              <button
                onClick={() => setRecoveryMode(false)}
                style={{
                  ...buttonStyle,
                  width: "100%",
                  marginTop: 10,
                  background: "#303047",
                  color: "#fff",
                }}
              >
                ↩️ Giriş Ekranına Dön
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleLogin}
                disabled={authBusy}
                style={{
                  ...buttonStyle,
                  width: "100%",
                  marginBottom: 10,
                }}
              >
                {authBusy ? "⏳ Bekle..." : "🔐 GİRİŞ YAP"}
              </button>

              <button
                onClick={handleSignUp}
                disabled={authBusy}
                style={{
                  ...buttonStyle,
                  width: "100%",
                  background: "linear-gradient(135deg, #8756d8, #6339a8)",
                  color: "#fff",
                  marginBottom: 10,
                }}
              >
                {authBusy ? "⏳ Bekle..." : "✨ ÜYE OL"}
              </button>

              <button
                onClick={() => setRecoveryMode(true)}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  color: "#c8adff",
                  padding: 12,
                  cursor: "pointer",
                }}
              >
                🔑 Şifremi Unuttum
              </button>
            </>
          )}

          <p
            style={{
              color: "#9999af",
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            Hesap sistemi Supabase üzerinden çalışır. E-posta
            doğrulaması etkinse kayıt sonrasında e-postanı kontrol et.
          </p>
        </div>
      )}
    </section>
  );
  // Ana uygulama ekranı
  if (!loaded) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#080808",
          color: "#f5d36b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 42 }}>👑</div>
        <h1>ROYAL SPIN</h1>
        <p>Oyun yükleniyor...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "16px",
        boxSizing: "border-box",
        background:
          "radial-gradient(circle at top, #30220b 0%, #111 35%, #050505 100%)",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {renderHeader()}

      {renderNavigation()}

      {renderMiniProfile()}

      {notice && (
        <div
          role="status"
          style={{
            ...panelStyle,
            marginTop: 12,
            border: "1px solid #d4af37",
            color: "#ffe7a0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <span>{notice}</span>

          <button
            onClick={() => setNotice("")}
            style={{
              ...smallButtonStyle,
              minWidth: 34,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {page === "home" && renderHome()}

      {page === "slot" && renderSlot()}
      {page === "zeus" && renderZeus()}
      {page === "wheel" && renderWheel()}
      {page === "profile" && renderProfile()}

      {page === "diamonds" && renderDiamonds()}

      {page === "daily" && renderDaily()}

      {page === "gift" && renderGift()}

      {page === "vip" && renderVIP()}
      {page === "svip" && renderSVIP()}
      {page === "badges" && renderBadges()}

      {page === "login" && renderLogin()}
       {page === "admin" &&
  (isAdmin ? (
    renderAdminPanel()
  ) : (
    <section style={panelStyle}>
      ⛔ Admin yetkisi gerekli.
    </section>
  ))}

      {page === "history" && (
        <section style={{ ...panelStyle, marginTop: 16 }}>
          <h2 style={{ color: "#f5d36b", marginTop: 0 }}>
            🎰 Slot Geçmişi
          </h2>

          {(!slotHistory || slotHistory.length === 0) ? (
            <p style={{ color: "#aaa" }}>
              Henüz oyun geçmişin bulunmuyor.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {slotHistory.map((item, index) => (
                <div
                  key={item.id || index}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "#171717",
                    border: "1px solid #393024",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold" }}>
                      {item.result || item.symbols || "Slot oyunu"}
                    </div>

                    <small style={{ color: "#aaa" }}>
                      {item.date || item.time || ""}
                    </small>
                  </div>

                  <strong
                    style={{
                      color:
                        Number(item.win || item.reward || 0) > 0
                          ? "#66e09a"
                          : "#ff8585",
                    }}
                  >
                    {Number(item.win || item.reward || 0) > 0 ? "+" : ""}
                    {Number(item.win || item.reward || 0)} 🪙
                  </strong>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={clearSlotHistory}
            style={{
              ...buttonStyle,
              marginTop: 14,
              background: "linear-gradient(135deg, #7c2424, #3d1111)",
            }}
          >
            🗑️ Geçmişi Temizle
          </button>
        </section>
      )}

      <footer
        style={{
          textAlign: "center",
          color: "#777",
          fontSize: 12,
          padding: "28px 8px 12px",
        }}
      >
        <div style={{ color: "#d4af37", fontWeight: "bold" }}>
          👑 ROYAL SPIN
        </div>

        <p>Şansını dene, eğlencenin tadını çıkar!</p>

        <small>Oyun içi sanal puanlar gerçek para değildir.</small>
      </footer>
      {/* ROYAL SPIN MÜŞTERİ HİZMETLERİ */}
<div
  style={{
    position: "fixed",
    right: 16,
    bottom: 16,
    zIndex: 9999,
    fontFamily: "Arial, sans-serif",
  }}
>
  {supportOpen && (
    <div
      style={{
        width: "min(340px, calc(100vw - 32px))",
        height: 420,
        maxHeight: "70vh",
        background: "#111",
        border: "1px solid #d4af37",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        marginBottom: 10,
        color: "white",
        boxShadow: "0 8px 30px #0008",
      }}
    >
      <div
        style={{
          padding: 14,
          background: "linear-gradient(135deg,#b8860b,#f5d76e)",
          color: "#111",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        👑 Royal Spin Destek
        <button onClick={() => setSupportOpen(false)}>✕</button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {supportMessages.map((message, index) => (
          <div
            key={index}
            style={{
              alignSelf:
                message.from === "user" ? "flex-end" : "flex-start",
              background:
                message.from === "user" ? "#574315" : "#252525",
              borderRadius: 10,
              padding: 10,
              maxWidth: "85%",
              overflowWrap: "anywhere",
            }}
          >
            {message.text}
          </div>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          answerSupport(supportInput);
        }}
        style={{ display: "flex", gap: 6, padding: 10 }}
      >
        <input
          value={supportInput}
          onChange={(event) => setSupportInput(event.target.value)}
          placeholder="Mesajını yaz..."
          style={{
            flex: 1,
            minWidth: 0,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #555",
            background: "#202020",
            color: "white",
          }}
        />
        <button type="submit" style={{ padding: "8px 12px" }}>
          ➤
        </button>
      </form>
    </div>
  )}

  <button
    onClick={() => setSupportOpen((open) => !open)}
    style={{
      display: "block",
      marginLeft: "auto",
      padding: "13px 18px",
      borderRadius: 30,
      border: "1px solid #f5d76e",
      background: "linear-gradient(135deg,#b8860b,#f5d76e)",
      color: "#111",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow: "0 5px 20px #0006",
    }}
  >
    💬 Müşteri Hizmetleri
  </button>
</div>      
    </main>
  );
}
