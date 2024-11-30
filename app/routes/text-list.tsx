import { json, MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import db from "../firebase.config";
import { useLoaderData } from "@remix-run/react";
import { fetchChatGPT } from "~/lib/chatGPT";

export const meta: MetaFunction = () => [
    { title: "Textkorrektur mit Fehleranalyse" },
    { name: "description", content: "Korrigiere deinen Text und zeige alle Korrekturen an." },
];

type Correction = {
    originalText: string;
    correctedText: string;
    corrections: {
        error: string;
        suggestion: string;
    }[];
    date: string;
};

// Loader für den API-Key und gespeicherte Korrekturen
export const loader = async () => {
    try {
        // Lade alle gespeicherten Korrekturen aus Firestore
        const querySnapshot = await getDocs(collection(db, "corrections"));
        const corrections: Correction[] = querySnapshot.docs.map((doc) => doc.data() as Correction);

        return json({
            apiKey: process.env.OPENAI_API_KEY,
            corrections,
        });
    } catch (err) {
        console.error("Error fetching corrections:", err);
        return json({
            apiKey: process.env.OPENAI_API_KEY,
            corrections: [],
        });
    }
};

export default function TextCorrection() {
    const { apiKey, corrections } = useLoaderData<typeof loader>();
    const [inputText, setInputText] = useState("");
    const [correctionDetails, setCorrectionDetails] = useState<Correction | null>(null);
    const [error, setError] = useState("");

    // Speichert eine Korrektur in Firestore
    const saveCorrectionToFirestore = async (correction: Correction) => {
        try {
            await setDoc(doc(db, "corrections", `${Date.now()}`), {
                ...correction,
                date: new Date().toISOString(),
            });
        } catch (err) {
            console.error("Error saving correction:", err);
        }
    };

    // Holt eine Korrektur von ChatGPT
    const fetchCorrectionDetails = async (text: string) => {
        const systemMessage = `Du bist ein Korrektor für deutsche Texte. Bitte korrigiere den folgenden Text und beschreibe die Fehler:
    "${text}".
    Antworte im JSON-Format:
    {
        "correctedText": "Der korrigierte Text",
        "corrections": [
            {
                "error": "Beschreibung des Fehlers",
                "suggestion": "Vorschlag zur Verbesserung"
            }
        ]
    }`;

        try {
            const data = await fetchChatGPT(apiKey, systemMessage, "system");
            const response = JSON.parse(data.choices[0].message.content);

            const newCorrection: Correction = {
                originalText: text,
                correctedText: response.correctedText,
                corrections: response.corrections,
                date: new Date().toLocaleDateString("de-DE"),
            };

            setCorrectionDetails(newCorrection); // Zeige die Korrektur an
            await saveCorrectionToFirestore(newCorrection); // Speichere die Korrektur
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

                {/* Ergebnis der aktuellen Korrektur */}
                {correctionDetails && (
                        <div className="mt-4 p-4 bg-gray-800 text-white rounded">
                            <h2 className="text-lg font-semibold">Ergebnisse</h2>
                            <p>
                                <strong>Original:</strong><br />
                                {correctionDetails.originalText}
                            </p>
                            <p className="mt-2">
                                <strong>Korrigierter Text:</strong><br />
                                {correctionDetails.correctedText}
                            </p>
                            <h3 className="text-lg font-semibold mt-4">Fehleranalyse:</h3>
                            <ul className="list-disc pl-6">
                                {correctionDetails.corrections.map((correction, index) => (
                                        <li key={index} className="mt-2">
                                            <strong>Fehler:</strong> {correction.error}<br />
                                            <strong>Vorschlag:</strong> {correction.suggestion}
                                        </li>
                                ))}
                            </ul>
                        </div>
                )}

                {error && <p className="text-red-500 mt-4">{error}</p>}

                {/* Liste aller gespeicherten Korrekturen */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold">Gespeicherte Korrekturen</h2>
                    {corrections.length > 0 ? (
                            <ul className="list-disc pl-6 mt-4">
                                {corrections.map((correction, index) => (
                                        <li key={index} className="mt-2">
                                            <strong>Original:</strong> {correction.originalText}<br />
                                            <strong>Korrigiert:</strong> {correction.correctedText}<br />
                                            <small className="text-gray-500">Korrigiert am: {correction.date}</small>
                                        </li>
                                ))}
                            </ul>
                    ) : (
                            <p className="mt-4">Noch keine Korrekturen gespeichert.</p>
                    )}
                </div>
            </div>
    );
}
