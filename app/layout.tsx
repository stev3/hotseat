import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "HotSeat - Live Rating App",
    description: "Rate participants in real-time",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}

