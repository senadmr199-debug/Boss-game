"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://klmjyeljhfozthxocjit.supabase.co",
  "sb_publishable_omCeokV2Z1-LibvDRVOQuQ_Y6htlTvl"
);

const styles = {
  page: {
    minHeight: "100vh",
    padding: "24px 14px",
    background:
      "radial-gradient(circle at top, #30200b 0%, #111 42%, #050505 100%)",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "850px",
    margin: "0 auto",
  },
  card: {
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,193,7,0.3)",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "16px",
  },
  button: {
    width: "100%",
    border: "none",
    borderRadius: "10px",
    padding: "13px",
    background: "linear-gradient(90deg,#b8860b,#ffe08a)",
    color: "#15100a",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#151515",
    border: "1px solid #66501d",
    borderRadius: "9px",
    padding: "12px",
    color: "#fff",
    marginTop: "7px",
    marginBottom: "12px",
    fontSize: "15px",
  },
};

export default function CoinsPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [packages, setPackages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({
    recipient_name: "",
    iban: "",
  });

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [senderName, setSenderName] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState("login");
  const [tab, setTab] = useState("shop");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;

    async function initialize() {
      const { data } = await supabase.auth.getSession();

      if (!alive) return;

      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      await loadPackages();

      if (currentUser) {
        await loadUserData(currentUser);
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        setTimeout(() => {
          loadUserData(currentUser);
        }, 0);
      } else {
        setIsAdmin(false);
        setOrders([]);
      }
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadPackages() {
    const { data, error } = await supabase
      .from("coin_packages")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      setNotice("Paketler yüklenemedi: " + error.message);
      return;
    }

    setPackages(data || []);
  }

  async function loadUserData(currentUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .maybeSingle();

    const admin = profile?.role === "admin";
    setIsAdmin(admin);

    const { data: paymentSettings } = await supabase
      .from("coin_payment_settings")
      .select("recipient_name, iban")
      .eq("id", 1)
      .maybeSingle();

    if (paymentSettings) {
      setSettings(paymentSettings);
    }

    const { data: myOrders, error } = await supabase
      .from("coin_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setOrders(myOrders || []);
    }

    if (admin) {
      setTab((current) => current);
    }
  }

  async function signInOrSignUp(event) {
    event.preventDefault();
    setBusy(true);
    setNotice("");

    try {
      const result =
        loginMode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (result.error) {
        throw result.error;
      }

      if (loginMode === "signup" && !result.data.session) {
        setNotice(
          "Kayıt isteğin alındı. E-posta doğrulaması istenirse gelen kutunu kontrol et."
        );
      } else {
        setNotice("İşlem başarılı.");
      }
    } catch (error) {
      setNotice(error.message || "İşlem başarısız.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setNotice("Oturum kapatıldı.");
  }

  async function createOrder(event) {
    event.preventDefault();

    if (!user) {
      setNotice("Önce hesabına giriş yapmalısın.");
      return;
    }

    if (!selectedPackage) {
      setNotice("Lütfen bir coin paketi seç.");
      return;
    }

    if (!senderName.trim()) {
      setNotice("Havale yapan kişinin adını yaz.");
      return;
    }

    if (!settings.iban?.trim()) {
      setNotice("Ödeme hesabı henüz yönetici tarafından ayarlanmamış.");
      return;
    }

    setBusy(true);
    setNotice("");

    try {
      const { error } = await supabase.from("coin_orders").insert({
        package_id: selectedPackage.id,
        sender_name: senderName.trim(),
        payment_note: paymentNote.trim(),
      });

      if (error) throw error;

      setNotice(
        "Sipariş oluşturuldu. Ödeme kontrol edildikten sonra coinlerin hesabına eklenecek."
      );

      setSenderName("");
      setPaymentNote("");
      setSelectedPackage(null);

      await loadUserData(user);
    } catch (error) {
      setNotice("Sipariş oluşturulamadı: " + error.message);
    } finally {
      setBusy(false);
    }
  }

  async function savePaymentSettings(event) {
    event.preventDefault();

    if (!isAdmin) {
      setNotice("Bu işlem için yönetici yetkisi gerekiyor.");
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase
        .from("coin_payment_settings")
        .update({
          recipient_name: settings.recipient_name,
          iban: settings.iban,
        })
        .eq("id", 1);

      if (error) throw error;

      setNotice("Ödeme bilgileri kaydedildi.");
    } catch (error) {
      setNotice("Kaydedilemedi: " + error.message);
    } finally {
      setBusy(false);
    }
  }

  async function reviewOrder(orderId, approve) {
    if (!isAdmin) {
      setNotice("Yönetici yetkisi gerekiyor.");
      return;
    }

    const question = approve
      ? "Bu siparişi onaylayıp coinleri eklemek istiyor musun?"
      : "Bu siparişi reddetmek istiyor musun?";

    if (!window.confirm(question)) return;

    setBusy(true);

    try {
      const { error } = await supabase.rpc("approve_coin_order", {
        p_order_id: orderId,
        p_approve: approve,
      });

      if (error) throw error;

      setNotice(
        approve
          ? "Sipariş onaylandı. Sistem coin ekleme işlemini gerçekleştirdi."
          : "Sipariş reddedildi."
      );

      await loadUserData(user);
    } catch (error) {
      setNotice("İşlem başarısız: " + error.message);
    } finally {
      setBusy(false);
    }
  }

  function money(value) {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  function statusText(status) {
    if (status === "pending") return "⏳ Bekliyor";
    if (status === "approved") return "✅ Onaylandı";
    if (status === "rejected") return "❌ Reddedildi";
    return status;
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "40px" }}>👑</div>
          <h1 style={{ color: "#ffcf54", margin: "5px 0" }}>
            ROYAL SPIN
          </h1>
          <h2 style={{ marginTop: "8px", fontSize: "21px" }}>
            🪙 Coin Merkezi
          </h2>
          <p style={{ color: "#bbb", lineHeight: 1.6 }}>
            Coin paketlerini incele, siparişini oluştur ve ödeme durumunu takip
            et.
          </p>
        </header>

        {notice && (
          <div
            role="status"
            style={{
              ...styles.card,
              borderColor: "#d8b34c",
              overflowWrap: "anywhere",
            }}
          >
            {notice}
            <button
              onClick={() => setNotice("")}
              style={{
                float: "right",
                background: "transparent",
                color: "#fff",
                border: 0,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {!user ? (
          <section style={styles.card}>
            <h2>👤 Hesabına giriş yap</h2>
            <p style={{ color: "#bbb" }}>
              Coin siparişi oluşturmak için Royal Spin hesabınla giriş yap.
            </p>

            <form onSubmit={signInOrSignUp}>
              <label>E-posta adresi</label>
              <input
                style={styles.input}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <label>Şifre</label>
              <input
                style={styles.input}
                type="password"
                autoComplete={
                  loginMode === "login" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
              />

              <button style={styles.button} disabled={busy}>
                {busy
                  ? "Lütfen bekle..."
                  : loginMode === "login"
                    ? "Giriş Yap"
                    : "Kayıt Ol"}
              </button>
            </form>

            <button
              onClick={() =>
                setLoginMode(loginMode === "login" ? "signup" : "login")
              }
              style={{
                background: "transparent",
                border: 0,
                color: "#ffcf54",
                padding: "16px 0 0",
                cursor: "pointer",
              }}
            >
              {loginMode === "login"
                ? "Hesabın yok mu? Kayıt ol"
                : "Zaten hesabın var mı? Giriş yap"}
            </button>
          </section>
        ) : (
          <>
            <section style={styles.card}>
              <div style={{ overflowWrap: "anywhere" }}>
                👤 {user.email}
              </div>

              {isAdmin && (
                <p style={{ color: "#ffcf54", fontWeight: "bold" }}>
                  👑 Yönetici hesabı
                </p>
              )}

              <button
                onClick={logout}
                style={{
                  ...styles.button,
                  marginTop: "12px",
                  background: "#292929",
                  color: "#fff",
                  border: "1px solid #555",
                }}
              >
                Oturumu Kapat
              </button>
            </section>

            <nav
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "18px",
              }}
            >
              {[
                ["shop", "🪙 Coin Al"],
                ["orders", "🧾 Siparişlerim"],
                ...(isAdmin ? [["admin", "👑 Yönetim"]] : []),
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setTab(value)}
                  style={{
                    flex: "1 1 130px",
                    padding: "12px 8px",
                    borderRadius: "9px",
                    border: "1px solid #8d6c25",
                    background: tab === value ? "#c69b35" : "#191919",
                    color: tab === value ? "#111" : "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {label}
                </button>
              ))}
            </nav>

            {tab === "shop" && (
              <>
                <section>
                  <h2>✨ Coin Paketleri</h2>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit,minmax(145px,1fr))",
                      gap: "12px",
                    }}
                  >
                    {packages.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedPackage(item)}
                        style={{
                          ...styles.card,
                          margin: 0,
                          textAlign: "left",
                          color: "#fff",
                          cursor: "pointer",
                          border:
                            selectedPackage?.id === item.id
                              ? "2px solid #ffe08a"
                              : "1px solid #59451c",
                          background:
                            selectedPackage?.id === item.id
                              ? "rgba(205,158,44,.18)"
                              : "rgba(255,255,255,.04)",
                        }}
                      >
                        <div style={{ fontSize: "27px" }}>🪙</div>
                        <strong>{item.name}</strong>
                        <div
                          style={{
                            color: "#ffcf54",
                            fontSize: "20px",
                            margin: "12px 0",
                            fontWeight: "bold",
                          }}
                        >
                          {Number(item.coins).toLocaleString("tr-TR")}
                        </div>
                        <div>{money(item.price_try)}</div>
                        <div style={{ fontSize: "12px", marginTop: "12px" }}>
                          {selectedPackage?.id === item.id
                            ? "✓ Seçildi"
                            : "Paketi seç"}
                        </div>
                      </button>
                    ))}
                  </div>

                  {packages.length === 0 && (
                    <p style={{ color: "#bbb" }}>
                      Şu anda aktif paket bulunmuyor. Daha sonra tekrar dene.
                    </p>
                  )}
                </section>

                <section style={{ ...styles.card, marginTop: "20px" }}>
                  <h2>🏦 Havale / EFT Bilgileri</h2>

                  <p style={{ color: "#bbb" }}>
                    Ödeme yapmadan önce seçtiğin paketin fiyatını kontrol et.
                    Havale yaptığın hesabın bilgilerini aşağıdan incele.
                  </p>

                  <div style={{ margin: "16px 0" }}>
                    <div style={{ color: "#aaa", fontSize: "13px" }}>
                      Alıcı
                    </div>
                    <strong>
                      {settings.recipient_name || "Henüz ayarlanmadı"}
                    </strong>
                  </div>

                  <div style={{ margin: "16px 0" }}>
                    <div style={{ color: "#aaa", fontSize: "13px" }}>
                      IBAN
                    </div>
                    <div
                      style={{
                        overflowWrap: "anywhere",
                        fontWeight: "bold",
                      }}
                    >
                      {settings.iban || "Henüz ayarlanmadı"}
                    </div>
                  </div>

                  <p style={{ fontSize: "13px", color: "#bbb" }}>
                    Ödeme yapmadan önce alıcı ve IBAN bilgilerini kontrol et.
                    Siparişin, ödeme kontrolü yapılana kadar beklemede kalır.
                  </p>
                </section>

                <section style={styles.card}>
                  <h2>🧾 Sipariş Oluştur</h2>

                  {selectedPackage ? (
                    <p style={{ color: "#ffcf54" }}>
                      Seçilen paket: <strong>{selectedPackage.name}</strong>
                      <br />
                      Coin:{" "}
                      {Number(selectedPackage.coins).toLocaleString("tr-TR")}
                      <br />
                      Tutar: {money(selectedPackage.price_try)}
                    </p>
                  ) : (
                    <p style={{ color: "#bbb" }}>
                      Önce yukarıdan bir paket seç.
                    </p>
                  )}

                  <form onSubmit={createOrder}>
                    <label>Havale yapan kişinin adı soyadı</label>
                    <input
                      style={styles.input}
                      value={senderName}
                      onChange={(event) => setSenderName(event.target.value)}
                      required
                      maxLength={100}
                    />

                    <label>
                      Ödeme açıklaması veya referans numarası (isteğe bağlı)
                    </label>
                    <input
                      style={styles.input}
                      value={paymentNote}
                      onChange={(event) => setPaymentNote(event.target.value)}
                      maxLength={200}
                    />

                    <button
                      style={styles.button}
                      disabled={busy || !selectedPackage}
                    >
                      {busy ? "İşleniyor..." : "Coin Siparişi Oluştur"}
                    </button>
                  </form>
                </section>
              </>
            )}

            {tab === "orders" && (
              <section style={styles.card}>
                <h2>🧾 Siparişlerim</h2>

                {orders.length === 0 && (
                  <p style={{ color: "#bbb" }}>Henüz siparişin bulunmuyor.</p>
                )}

                {orders.map((order) => (
                  <article
                    key={order.id}
                    style={{
                      borderTop: "1px solid #51401e",
                      padding: "14px 0",
                      overflowWrap: "anywhere",
                    }}
                  >
                    <strong>{order.package_name}</strong>
                    <p>
                      🪙 {Number(order.coins).toLocaleString("tr-TR")} coin
                    </p>
                    <p>{money(order.price_try)}</p>
                    <p>{statusText(order.status)}</p>
                    <small style={{ color: "#aaa" }}>
                      {new Date(order.created_at).toLocaleString("tr-TR")}
                    </small>
                  </article>
                ))}
              </section>
            )}

            {tab === "admin" && isAdmin && (
              <>
                <section style={styles.card}>
                  <h2>👑 Yönetici Paneli</h2>
                  <p style={{ color: "#bbb" }}>
                    Bu bölüm yalnızca yönetici hesabında görünür. IBAN
                    bilgilerini güncelle ve coin siparişlerini yönet.
                  </p>
                </section>

                <section style={styles.card}>
                  <h2>🏦 Ödeme Bilgilerini Düzenle</h2>

                  <form onSubmit={savePaymentSettings}>
                    <label>Alıcı adı soyadı</label>
                    <input
                      style={styles.input}
                      value={settings.recipient_name || ""}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          recipient_name: event.target.value,
                        })
                      }
                      required
                    />

                    <label>IBAN</label>
                    <input
                      style={styles.input}
                      value={settings.iban || ""}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          iban: event.target.value,
                        })
                      }
                      required
                    />

                    <button style={styles.button} disabled={busy}>
                      Ödeme Bilgilerini Kaydet
                    </button>
                  </form>
                </section>

                <section style={styles.card}>
                  <h2>📋 Gelen Coin Siparişleri</h2>

                  {orders.length === 0 && (
                    <p style={{ color: "#bbb" }}>Henüz sipariş yok.</p>
                  )}

                  {orders.map((order) => (
                    <article
                      key={order.id}
                      style={{
                        borderTop: "1px solid #51401e",
                        padding: "14px 0",
                        overflowWrap: "anywhere",
                      }}
                    >
                      <strong>{order.package_name}</strong>
                      <p>
                        🪙 {Number(order.coins).toLocaleString("tr-TR")} coin
                      </p>
                      <p>{money(order.price_try)}</p>
                      <p>Gönderen: {order.sender_name || "Belirtilmemiş"}</p>
                      <p>
                        Açıklama: {order.payment_note || "Belirtilmemiş"}
                      </p>
                      <p>Durum: {statusText(order.status)}</p>

                      {order.status === "pending" && (
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginTop: "12px",
                          }}
                        >
                          <button
                            onClick={() => reviewOrder(order.id, true)}
                            disabled={busy}
                            style={{
                              ...styles.button,
                              flex: 1,
                              background: "#1c8b4a",
                              color: "#fff",
                            }}
                          >
                            Onayla
                          </button>

                          <button
                            onClick={() => reviewOrder(order.id, false)}
                            disabled={busy}
                            style={{
                              ...styles.button,
                              flex: 1,
                              background: "#a52b2b",
                              color: "#fff",
                            }}
                          >
                            Reddet
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </section>
              </>
            )}
          </>
        )}

        <footer
          style={{
            textAlign: "center",
            color: "#777",
            fontSize: "12px",
            padding: "18px 0",
          }}
        >
          ROYAL SPIN • Coin Merkezi
        </footer>
      </div>
    </main>
  );
}
