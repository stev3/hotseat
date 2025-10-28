"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTime } from "@/lib/utils";

type SessionState = {
    status: string;
    attendeesCount: number;
    queue: string[];
};

type RoundState = {
    roundId: string | null;
    participantName: string;
    endsAt: Date | null;
    isRunning: boolean;
    msRemaining: number;
    average: number | null;
    votesCount: number;
    deduction: number;
    totalAfterDeduction: number | null;
};

export default function HostPage() {
    const params = useParams();
    const router = useRouter();
    const code = params.code as string;

    const [session, setSession] = useState<any>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [sessionState, setSessionState] = useState<SessionState>({
        status: "LOBBY",
        attendeesCount: 0,
        queue: [],
    });
    const [queueInput, setQueueInput] = useState("");
    const [queue, setQueue] = useState<string[]>([]);
    const [roundState, setRoundState] = useState<RoundState>({
        roundId: null,
        participantName: "",
        endsAt: null,
        isRunning: false,
        msRemaining: 30000,
        average: null,
        votesCount: 0,
        deduction: 0,
        totalAfterDeduction: null,
    });
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchSession();
        initializeSocket();

        const joinUrl = `${window.location.origin}/join/${code}`;
        QRCode.toDataURL(joinUrl).then((url) => setQrCodeUrl(url));

        return () => {
            if (socket) socket.disconnect();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [code]);

    const fetchSession = async () => {
        const res = await fetch(`/api/session/${code}`);
        const data = await res.json();
        setSession(data);
        setSessionState({
            status: data.status,
            attendeesCount: data.participants?.length || 0,
            queue: [],
        });
    };

    const initializeSocket = () => {
        const socketInstance = io({
            path: "/api/socket/io",
            transports: ["websocket", "polling"],
        });

        socketInstance.on("session:state", (data: SessionState) => {
            setSessionState(data);
        });

        socketInstance.on("round:started", (data: any) => {
            setRoundState({
                roundId: data.roundId,
                participantName: data.participantName,
                endsAt: new Date(data.endsAt),
                isRunning: true,
                msRemaining: 30000,
                average: null,
                votesCount: 0,
                deduction: 0,
                totalAfterDeduction: null,
            });
        });

        socketInstance.on("round:tick", (data: any) => {
            setRoundState((prev) => ({
                ...prev,
                msRemaining: data.msRemaining,
            }));
        });

        socketInstance.on("round:ended", (data: any) => {
            setRoundState((prev) => ({
                ...prev,
                isRunning: false,
                average: data.average,
                votesCount: data.votesCount,
                deduction: data.deduction,
                totalAfterDeduction: data.totalAfterDeduction,
            }));
        });

        socketInstance.on("redirect", (data: any) => {
            router.push(data.url);
        });

        setSocket(socketInstance);
    };

    const addToQueue = () => {
        if (queueInput.trim()) {
            setQueue([...queue, queueInput.trim()]);
            setQueueInput("");
        }
    };

    const startSession = () => {
        if (socket && sessionState.attendeesCount > 0) {
            socket.emit("host:startSession", { sessionCode: code });
        }
    };

    const startRound = (participantName: string) => {
        if (socket) {
            socket.emit("host:startRound", { sessionCode: code, participantName });
        }
        setQueue((q) => q.filter((name) => name !== participantName));
    };

    const applyDeduction = () => {
        if (socket && roundState.roundId) {
            socket.emit("host:applyDeduction", {
                roundId: roundState.roundId,
                deduction: roundState.deduction,
            });
        }
    };

    const finishSession = () => {
        if (socket) {
            socket.emit("host:finishSession", { sessionCode: code });
        }
    };

    const copyJoinUrl = () => {
        const joinUrl = `${window.location.origin}/join/${code}`;
        navigator.clipboard.writeText(joinUrl);
    };

    if (!session) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h1 className="text-3xl font-bold">{session.title}</h1>
                    <p className="mt-2 text-gray-600">Code: {code}</p>
                </div>

                {/* QR Code & Status */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-semibold">Join Link</h2>
                        <div className="mb-4">
                            {qrCodeUrl && (
                                <img src={qrCodeUrl} alt="QR Code" className="mx-auto w-48" />
                            )}
                        </div>
                        <Button onClick={copyJoinUrl} variant="outline" className="w-full">
                            Copy Join URL
                        </Button>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-semibold">Status</h2>
                        <p className="text-2xl font-bold text-blue-600">
                            {sessionState.attendeesCount} Attendees
                        </p>
                        <p className="mt-2 text-gray-600">
                            Status: {sessionState.status}
                        </p>
                    </div>
                </div>

                {/* Queue */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">Participant Queue</h2>
                    <div className="mb-4 flex gap-2">
                        <Input
                            value={queueInput}
                            onChange={(e) => setQueueInput(e.target.value)}
                            placeholder="Participant name"
                            onKeyDown={(e) => e.key === "Enter" && addToQueue()}
                        />
                        <Button onClick={addToQueue}>Add</Button>
                    </div>
                    <div className="space-y-2">
                        {queue.map((name, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between rounded border p-2"
                            >
                                <span>{name}</span>
                                <Button
                                    size="sm"
                                    onClick={() => startRound(name)}
                                    disabled={sessionState.status !== "ACTIVE"}
                                >
                                    Start Round
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                {sessionState.status === "LOBBY" && (
                    <Button
                        onClick={startSession}
                        disabled={sessionState.attendeesCount === 0}
                        className="w-full"
                        size="lg"
                    >
                        Start Session
                    </Button>
                )}

                {/* Round Display */}
                {roundState.isRunning && (
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-2xl font-bold">
                            Rating: {roundState.participantName}
                        </h2>
                        <div className="text-6xl font-bold text-blue-600">
                            {formatTime(roundState.msRemaining)}
                        </div>
                    </div>
                )}

                {/* Round Results */}
                {!roundState.isRunning && roundState.average !== null && (
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-semibold">Round Results</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Average</p>
                                <p className="text-2xl font-bold">{roundState.average.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Votes</p>
                                <p className="text-2xl font-bold">{roundState.votesCount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold">{roundState.totalAfterDeduction?.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Input
                                type="number"
                                min="0"
                                max="10"
                                value={roundState.deduction}
                                onChange={(e) =>
                                    setRoundState((prev) => ({
                                        ...prev,
                                        deduction: parseInt(e.target.value) || 0,
                                    }))
                                }
                                placeholder="Deduction (0-10)"
                            />
                            <Button onClick={applyDeduction}>Apply Deduction</Button>
                        </div>
                    </div>
                )}

                {/* Finish */}
                {sessionState.status === "ACTIVE" && !roundState.isRunning && (
                    <Button onClick={finishSession} variant="destructive" className="w-full">
                        Finish Session
                    </Button>
                )}
            </div>
        </div>
    );
}

