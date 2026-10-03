import HistoryClient from "@/components/wallet/HistoryClient";

export const metadata = { title: "Wallet history" };

export default async function HistoryPage({ searchParams }) {
    const { tab } = await searchParams;
    return <HistoryClient initialTab={tab === "withdraw" ? "withdraw" : "deposit"} />;
}