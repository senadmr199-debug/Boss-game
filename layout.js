export const metadata = {
title: “BOSS GAME”,
description: “Oyunun patronu sensin!”,
};

export default function RootLayout({ children }) {
return (
<body style={{ margin: 0 }}>
{children}
);
}
