"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import {Spinner} from "@heroui/spinner";


interface ApiTestProps {
    apikey: string;
}

export default function ApiTest(props: ApiTestProps) {
    const [messages, setMessages] = useState<string[]>([]);
    const [jsonData, setJsonData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const callOrchestrator = async () => {
        setMessages([]);
        setJsonData(null);
        setLoading(true);

        const query = "Should the client invest in cryptocurrency given this portfolio and current market fluctuations?";
        const portfolio = {
            assets: [
                { ticker: "AAPL", shares: 10, purchasePrice: 150 },
                { ticker: "TSLA", shares: 5, purchasePrice: 700 },
                { ticker: "GOOGL", shares: 8, purchasePrice: 2500 },
                { ticker: "TMO", shares: 15, purchasePrice: 1000 }
            ],
            cash: 5000,
        };
        const apiKey = props.apikey;

        try {
            const res = await fetch("/api/orchestrator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey, query, portfolio }),
            });

            // Read the response as a stream
            const reader = res.body?.getReader();
            if (!reader) throw new Error("Failed to read response stream");

            const decoder = new TextDecoder();
            let newMessages: string[] = [];
            let fullText = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                // Decode the streamed text
                const chunk = decoder.decode(value, { stream: true });
                fullText += chunk; // Append to full response

                // Update UI with new message (excluding the final JSON)
                if (!chunk.startsWith("FINAL_JSON:")) {
                    newMessages = [...newMessages, chunk.trim()];
                    setMessages([...newMessages]);
                }
            }

            // Extract JSON data from the last message
            const jsonMatch = fullText.match(/FINAL_JSON:(\{.*\})/);
            if (jsonMatch) {
                const jsonData = JSON.parse(jsonMatch[1]);
                setJsonData(jsonData);
            }

        } catch (error) {
            console.error("Error calling orchestrator:", error);
            setMessages(["Error communicating with the server."]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-5">
            <Button onPress={callOrchestrator} disabled={loading}>
                Call Orchestrator
            </Button>
            {loading && <div className="flex gap-5">
                <Spinner/>
                {messages.length > 0 ? <p>{messages[messages.length-1]}</p> : <></>}
            </div>}
            {jsonData && (
                <div className="mt-4 p-3 border rounded">
                    <h3 className="font-bold">Final Analysis</h3>
                    <pre>{JSON.stringify(jsonData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
