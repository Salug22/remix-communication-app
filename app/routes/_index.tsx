import type { MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { useState, useEffect } from "react";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import db from "../firebase.config";
import dotenv from "dotenv";

dotenv.config();
const API_KEY = process.env.OPENAI_API_KEY;
export const meta: MetaFunction = () => {
    return [
        { title: "ChatGPT Integration" },
        { name: "description", content: "Generate and store words using ChatGPT." },
    ];
};

export default function Index() {
    const [word, setWord] = useState("");
    const [definition, setDefinition] = useState("");
    const [example, setExample] = useState("");
    const [customWord, setCustomWord] = useState("");
    const [excludedWords, setExcludedWords] = useState<string[]>([]);
    const [error, setError] = useState("");

    // Abrufen aller verwendeten Begriffe
    const fetchExcludedWords = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "excludedWords"));
            const words: string[] = [];
            querySnapshot.forEach((doc) => {
                words.push(doc.data().word);
            });
            setExcludedWords(words);
        } catch (err) {
            console.error("Fehler beim Abrufen der ausgeschlossenen Wörter:", err);
        }
    };

    // Speichert ein Wort in Firestore
    const saveWordToFirestore = async (newWord: any) => {
        try {
            await setDoc(doc(db, "words", newWord.word), {
                ...newWord,
                createdAt: new Date(),
            });
            setExcludedWords((prev) => [...prev, newWord.word]);
        } catch (err) {
            console.error("Fehler beim Speichern:", err);
        }
    };

    // ChatGPT: Neues Wort generieren oder benutzerdefiniertes Wort suchen
    const fetchWord = async (customInput: string | null = null) => {
        const isCustom = customInput !== null;
        const term = isCustom ? customInput : "Gib mir ein neues Wort.";
        const excluded = excludedWords.join(", ");

        const systemMessage = {
            role: "system",
            content: `Du bist ein Sprachassistent, der detaillierte Informationen zu einem Begriff liefert.
        ${isCustom ? `Der Begriff ist: "${customInput}".` : ""}
        Begriffe sollten anspruchsvoll, aber nicht zu akademisch sein. Die folgenden Begriffe wurden bereits verwendet: ${excluded}.
        Antworte im JSON-Format:
        {
            "word": "Wort",
            "definition": "Kurze, präzise Erklärung des Begriffs.",
            "example": "Ein Satz, der zeigt, wie der Begriff verwendet werden kann."
        }`,
        };

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        systemMessage,
                        { role: "user", content: term },
                    ],
                }),
            });

            if (!response.ok) throw new Error(`Fehler: ${response.status}`);
            const data = await response.json();
            const jsonResponse = JSON.parse(data.choices[0].message.content);

            const newWord = {
                word: jsonResponse.word,
                definition: jsonResponse.definition,
                example: jsonResponse.example,
                date: new Date().toLocaleDateString("de-DE"),
                tag: isCustom ? "custom" : "generated",
            };

            setWord(newWord.word);
            setDefinition(newWord.definition);
            setExample(newWord.example);
            await saveWordToFirestore(newWord);
            setError("");
        } catch (err) {
            console.error("Fehler beim Abrufen:", err.message);
            setError("Es gab einen Fehler. Bitte versuche es erneut.");
        }
    };

    useEffect(() => {
        fetchExcludedWords();
    }, []);

    return (
            <div className="flex flex-col items-center gap-8 p-4">
                <header>
                    <h1 className="text-2xl font-bold">ChatGPT Integration</h1>
                </header>

                {/* Neues Wort generieren */}
                <Button onClick={() => fetchWord(null)}>Neues Wort generieren</Button>

                {/* Benutzerdefiniertes Wort suchen */}
                <div className="flex gap-4">
                    <input
                            type="text"
                            value={customWord}
                            onChange={(e) => setCustomWord(e.target.value)}
                            placeholder="Begriff eingeben"
                            className="border p-2 rounded"
                    />
                    <Button onClick={() => fetchWord(customWord)}>Begriff suchen</Button>
                </div>

                {/* Ergebnis anzeigen */}
                {word && (
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold">Begriff: {word}</h2>
                            <p>
                                <strong>Definition:</strong> {definition}
                            </p>
                            <p>
                                <strong>Beispielsatz:</strong> {example}
                            </p>
                        </div>
                )}

                {/* Fehlermeldung */}
                {error && <p className="text-red-500">{error}</p>}
            </div>
    );
}
