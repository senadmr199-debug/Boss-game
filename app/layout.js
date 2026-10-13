import “./globals.css”;

export const metadata = {
title: “BOSS GAME”,
description: “BOSS GAME - Oyun ve eğlence platformu”,
};

export default function RootLayout({ children }) {
return (
<body style={{ margin: 0 }}>
{children}
);
}
