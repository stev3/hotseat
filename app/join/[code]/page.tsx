"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
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
    hasVoted: boolean;
    myScore: number | null;
};

export default function JoinPage() {
    const params = useParams();
    const router = useRouter();
    const code = params.code as string;

    const [socket, setSocket] = useState<Socket | null>(null);
    const [name, setName] = useState("");
    const [isNameSet, setIsNameSet] = useState(false);
    const [sessionState, setSessionState] = useState<SessionState>({
        status: "LOBBY",
        attendeesCount: 0,
        queue: [],
    });
    const [roundState, setRoundState] = useState<RoundState>({
        roundId: null,
        participantName: "",
        endsAt: null,
        isRunning: false,
        hasVoted: false,
        myScore: null,
    });
    const [score, setScore] = useState(5);

    useEffect(() => {
        const storedName = localStorage.getItem(`participant:${code}`);
        if (storedName) {
            setName(storedName);
            setIsNameSet(true);
            initializeSocket(storedName);
        }

        return () => {
            if (socket) socket.disconnect();
        };
    }, [code]);

    const initializeSocket = (participantName: string) => {
        const socketInstance = io({
            path: "/api/socket/io",
            transports: ["websocket", "polling"],
        });

        socketInstance.on("connect", () => {
            socketInstance.emit("attendee:join", {
                sessionCode: code,
                participantName,
            });
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
                hasVoted: false,
                myScore: null,
            });
        });

        socketInstance.on("round:tick", () => {
            // UI can show countdown if needed
        });

        socketInstance.on("round:ended", () => {
            setRoundState((prev) => ({
                ...prev,
                isRunning: false,
            }));
        });

        socketInstance.on("vote:recorded", () => {
            setRoundState((prev) => ({
                ...prev,
                hasVoted: true,
            }));
        });

        socketInstance.on("error", (data: any) => {
            console.error("Socket error:", data.message);
            alert(data.message);
        });

        setSocket(socketInstance);
    };

    const handleSetName = () => {
        if (name.trim()) {
            localStorage.setItem(`participant:${code}`, name.trim());
            setIsNameSet(true);
            initializeSocket(name.trim());
        }
    };

    const handleSubmitVote = () => {
        if (socket && roundState.roundId) {
            socket.emit("vote:submit", {
                roundId: roundState.roundId,
                score,
            });
        }
    };

    const handleKeyPress = (value: number) => {
        if (roundState.isRunning && !roundState.hasVoted) {
            setScore(value);
        }
    };

    // Handle keyboard shortcuts
    useEffect(() => {
        if (!roundState.isRunning || roundState.hasVoted) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const key = parseInt(e.key);
            if (key >= 1 && key <= 9) {
                handleKeyPress(key);
            } else if (e.key === "0") {
                handleKeyPress(10);
            } else if (e.key === "Enter" && roundState.roundId) {
                handleSubmitVote();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [roundState.isRunning, roundState.hasVoted, score]);

    if (!isNameSet) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
                <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
                    <h1 className="text-center text-3xl font-bold text-gray-900">
                        Join Session
                    </h1>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Name
                        </label>
                        <Input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSetName()}
                            autoFocus
                        />
                    </div>
                    <Button onClick={handleSetName} className="w-full" size="lg">
                        Join
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-2xl p-4">
                {/* Lobby */}
                {sessionState.status === "LOBBY" && (
                    <div className="rounded-lg bg-white p-8 text-center shadow">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Waiting for session to start...
                        </h1>
                        <p className="mt-4 text-gray-600">
                            You are logged in as <strong>{name}</strong>
                        </p>
                    </div>
                )}

                {/* Active Round */}
                {sessionState.status === "ACTIVE" && roundState.isRunning && (
                    <div className="space-y-6 rounded-lg bg-white p-8 shadow">
                        <div className="text-center">
                            <h2 className="text-4xl font-bold text-gray-900">
                                {roundState.participantName}
                            </h2>
                            <p className="mt-2 text-gray-600">Rate this participant</p>
                        </div>

                        {!roundState.hasVoted ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-5 gap-2 md:grid-cols-5">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                                        <Button
                                            key={value}
                                            onClick={() => handleKeyPress(value)}
                                            variant={score === value ? "default" : "outline"}
                                            size="lg"
                                            className="text-2xl font-bold"
                                        >
                                            {value}
                                        </Button>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <p className="text-center text-sm text-gray-600">
                                        Your score: <strong className="text-lg">{score}</strong>
                                    </p>
                                    <p className="text-center text-xs text-gray-500">
                                        Press 1-9 or 0 (for 10) or click buttons
                                    </p>
                                </div>

                                <Button
                                    onClick={handleSubmitVote}
                                    className="w-full"
                                    size="lg"
                                    disabled={!roundState.roundId}
                                >
                                    Submit Vote
                                </Button>
                            </div>
                        ) : (
                            <div className="rounded-lg bg-green-50 p-6 text-center">
                                <p className="text-2xl font-bold text-green-800">
                                    Vote Recorded: {roundState.myScore || score}
                                </p>
                                <p className="mt-2 text-gray-600">Wait for next participant...</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Waiting for next round */}
                {sessionState.status === "ACTIVE" && !roundState.isRunning && (
                    <div className="rounded-lg bg-white p-8 text-center shadow">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Thanks! Next up soon...
                        </h2>
                    </div>
                )}
            </div>
        </div>
    );
}

