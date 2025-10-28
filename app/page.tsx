"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleCreateSession = async () => {
        if (!title.trim()) {
            alert("Please enter a session title");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
            });

            const data = await res.json();
            if (res.ok && data.code) {
                router.push(`/host/${data.code}`);
            } else {
                alert("Failed to create session");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to create session");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900">HotSeat</h1>
                    <p className="mt-2 text-gray-600">Live Rating Sessions</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Session Title
                        </label>
                        <Input
                            id="title"
                            type="text"
                            placeholder="Enter session name..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateSession()}
                            autoFocus
                        />
                    </div>

                    <Button
                        onClick={handleCreateSession}
                        disabled={isLoading}
                        className="w-full"
                        size="lg"
                    >
                        {isLoading ? "Creating..." : "Begin"}
                    </Button>
                </div>

                <p className="text-center text-sm text-gray-500">
                    Create a session and share the QR code with attendees
                </p>
            </div>
        </div>
    );
}

