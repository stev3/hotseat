"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type ScoreboardRow = {
    participantName: string;
    average: number;
    deduction: number;
    totalAfterDeduction: number;
};

export default function ResultsPage() {
    const params = useParams();
    const code = params.code as string;
    const [scoreboard, setScoreboard] = useState<ScoreboardRow[]>([]);

    useEffect(() => {
        fetchResults();
    }, [code]);

    const fetchResults = async () => {
        const res = await fetch(`/api/session/${code}/scoreboard`);
        if (res.ok) {
            const data = await res.json();
            setScoreboard(data.scoreboard || []);
        }
    };

    const exportCSV = () => {
        const headers = ["participantName", "average", "deduction", "totalAfterDeduction"];
        const rows = scoreboard.map((row) => [
            row.participantName,
            row.average.toFixed(2),
            row.deduction.toFixed(2),
            row.totalAfterDeduction.toFixed(2),
        ]);

        const csv = [
            headers.join(","),
            ...rows.map((row) => row.join(",")),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hotseat-${code}.csv`;
        a.click();
    };

    const exportJSON = () => {
        const json = JSON.stringify(scoreboard, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `hotseat-${code}.json`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="rounded-lg bg-white p-8 shadow">
                    <h1 className="mb-8 text-center text-4xl font-bold text-gray-900">
                        Final Results
                    </h1>

                    <div className="mb-6 flex gap-4">
                        <Button onClick={exportCSV} variant="outline">
                            Copy CSV
                        </Button>
                        <Button onClick={exportJSON} variant="outline">
                            Export JSON
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-300">
                                    <th className="p-4 text-left font-semibold">Participant</th>
                                    <th className="p-4 text-right font-semibold">Average</th>
                                    <th className="p-4 text-right font-semibold">Deduction</th>
                                    <th className="p-4 text-right font-semibold">Total (After Deduction)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scoreboard.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        className={`border-b ${idx < 3 ? "bg-yellow-50" : ""
                                            }`}
                                    >
                                        <td className="p-4 font-medium">{row.participantName}</td>
                                        <td className="p-4 text-right">{row.average.toFixed(2)}</td>
                                        <td className="p-4 text-right">{row.deduction.toFixed(2)}</td>
                                        <td className="p-4 text-right font-bold">
                                            {row.totalAfterDeduction.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {scoreboard.length === 0 && (
                        <p className="mt-8 text-center text-gray-500">
                            No results yet. Session may not be finished.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

