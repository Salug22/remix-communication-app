import { json, MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import db from "../firebase.config";
import { useLoaderData } from "@remix-run/react";
import { fetchChatGPT } from "~/lib/chatGPT";
import {generateSystemMessage} from "~/utils/systemMessages";
import {Badge} from "~/components/ui/badge";

export const meta: MetaFunction = () => [
    { title: "Synonyme Generator" },
    { name: "description", content: "Generate and store synonyms using ChatGPT." },
];

type Synonyme = {
    word: string; // Das ursprüngliche Wort
    synonym: string; // Das generierte Synonyme
    date: string; // Datum der Erstellung
};

// Loader für den API-Key
export const loader = async () => {
    return json({
        apiKey: process.env.OPENAI_API_KEY,
    });
};

export default function SynonymGenerator() {
    const { apiKey } = useLoaderData<typeof loader>();
    const [customWord, setCustomWord] = useState("");
    const [generatedSynonym, setGeneratedSynonym] = useState<Synonyme | null>(null);
    const [error, setError] = useState("");

    // Save a synonym to Firestore
    const saveSynonymToFirestore = async (newSynonym: Synonyme) => {
        try {
            await setDoc(doc(db, "synonyms", newSynonym.word), {
                ...newSynonym,
                date: new Date().toISOString(),
            });
        } catch (err) {
            console.error("Error saving synonym:", err);
        }
    };

    // Fetch a synonym from ChatGPT
    const fetchSynonymFromChatGPT = async (word: string) => {
        const systemMessage = generateSystemMessage("synonym", word); // Typ "synonym" verwenden

        try {
            const data = await fetchChatGPT(apiKey, systemMessage, "system");
            const response = JSON.parse(data.choices[0].message.content);

            const newSynonym: Synonyme = {
                word: word,
                synonym: response.synonym,
                date: new Date().toLocaleDateString("de-DE"),
            };

            setGeneratedSynonym(newSynonym); // Zeige das generierte Synonyme an
            await saveSynonymToFirestore(newSynonym);
        } catch (err) {
            setError("Error fetching synonym from ChatGPT.");
            console.error(err);
        }
    };

    return (
            <div className="container m-auto">
                <h1 className="text-2xl font-bold mb-4">Synonym Generator</h1>

                {/* Synonyme generieren */}
                <div className="flex flex-col gap-4 mt-4">
                    <input
                            type="text"
                            value={customWord}
                            onChange={(e) => setCustomWord(e.target.value)}
                            placeholder="Wort einfügen"
                            className="border p-2 rounded w-full"
                    />
                    <Button variant="secondary" onClick={() => fetchSynonymFromChatGPT(customWord)}>Synonym erstellen</Button>
                </div>

                {/* Generiertes Synonyme anzeigen */}
                {generatedSynonym && (
                        <div className="mt-4 p-4 bg-gray-800">
                            <h2 className="text-lg font-semibold flex pb-2 justify-between">{generatedSynonym.word}</h2>
                            <p>
                                <strong>Synonyme:</strong><br/> {generatedSynonym.synonym}
                            </p>
                        </div>
                )}

                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
    );
}
