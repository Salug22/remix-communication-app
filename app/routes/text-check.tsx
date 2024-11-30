import { json, MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import db from "../firebase.config";
import { useLoaderData } from "@remix-run/react";
import { fetchChatGPT } from "~/lib/chatGPT";
import { generateSystemMessage } from "~/utils/systemMessages";

export const meta: MetaFunction = () => [
    { title: "Textkorrektur mit Fehleranalyse" },
    { name: "description", content: "Korrigiere deinen Text und verstehe die Fehler." },
];

type Correction = {
    originalText: string; // Der ursprüngliche Text
    correctedText: string; // Der korrigierte Text
    stylised: string; // Der korrigierte Text
    corrections: {
        error: string; // Beschreibung des Fehlers
        suggestion: string; // Verbesserungsvorschlag
    }[]; // Liste der Fehler und Korrekturen
    date: string; // Datum der Korrektur
};

// Loader für den API-Key
export const loader = async () => {
    return json({
        apiKey: process.env.OPENAI_API_KEY,
    });
};

export default function TextCorrection() {
    const { apiKey } = useLoaderData<typeof loader>();
    const [inputText, setInputText] = useState("");
    const [correctionDetails, setCorrectionDetails] = useState<Correction | null>(null);
    const [error, setError] = useState("");

    // Speichert die Korrektur in Firestore
    const saveCorrectionToFirestore = async (correction: Correction) => {
        try {
            await setDoc(doc(db, "corrections", correction.date), {
                ...correction,
                date: new Date().toISOString(),
            });
        } catch (err) {
            console.error("Error saving correction:", err);
        }
    };

    // Holt die Korrektur von ChatGPT
    const fetchCorrectionDetails = async (text: string) => {
        const systemMessage = generateSystemMessage("check", text);

        try {
            const data = await fetchChatGPT(apiKey, systemMessage, "system");
            const response = JSON.parse(data.choices[0].message.content);

            const newCorrection: Correction = {
                originalText: text,
                correctedText: response.correctedText,
                stylised: response.stylised,
                corrections: response.corrections || [], // Fallback auf ein leeres Array
                date: new Date().toLocaleDateString("de-DE"),
            };

            setCorrectionDetails(newCorrection); // Zeige die Korrektur und Fehleranalyse an
            await saveCorrectionToFirestore(newCorrection); // Optional: Speichere die Korrektur
        } catch (err) {
            setError("Error fetching correction details.");
            console.error(err);
        }
    };

    return (
            <div className="container m-auto">
                <h1 className="text-2xl font-bold mb-4">Textkorrektur mit Fehleranalyse</h1>

                {/* Textkorrektur-Formular */}
                <div className="flex flex-col gap-4 mt-4">
        <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Füge deinen Text ein..."
                className="border p-2 rounded w-full h-32"
        />
                    <Button variant="secondary" onClick={() => fetchCorrectionDetails(inputText)}>
                        Text korrigieren
                    </Button>
                </div>

                {correctionDetails && (
                        <div className="mt-4 p-4 bg-gray-800 text-white rounded">
                            <h2 className="text-lg font-semibold">Ergebnisse</h2>
                            <p>
                                <strong>Original:</strong><br/>
                                {correctionDetails.originalText}
                            </p>
                            <p className="mt-2">
                                <strong>Korrigierter Text:</strong><br/>
                                {correctionDetails.correctedText}
                            </p>
                            {correctionDetails.stylised ? (
                                    <p className="mt-2">
                                        <strong>Besserer Stil:</strong><br/>
                                        {correctionDetails.stylised}
                                    </p>
                            ): null}
                            <h3 className="text-lg font-semibold mt-4">Fehleranalyse:</h3>
                            <ul className="list-disc pl-6">
                            {correctionDetails.corrections.length > 0 ? (
                                        correctionDetails.corrections.map((correction, index) => (
                                                <li key={index} className="mt-2">
                                                    <strong>Fehler:</strong> {correction.error}<br/>
                                                    <strong>Vorschlag:</strong> {correction.suggestion}
                                                </li>
                                        ))
                                ) : (
                                        <li>Keine Fehler gefunden.</li>
                                )}
                            </ul>
                        </div>
                )}

                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
    );
}
