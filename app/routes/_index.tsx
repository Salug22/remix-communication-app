import { json, MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { saveToFirestore } from "~/helper/firestoreHelpers"; // Import der ausgelagerten Speicherfunktion
import db from "../firebase.config";
import { useLoaderData } from "@remix-run/react";
import { fetchChatGPT } from "~/lib/chatGPT";
import { generateSystemMessage } from "~/utils/systemMessages";
import { Badge } from "~/components/ui/badge";

export const meta: MetaFunction = () => [
    { title: "ChatGPT Integration" },
    { name: "description", content: "Generate and store words using ChatGPT." },
];

type Word = {
    word: string;
    definition: string;
    example: string;
    date: string;
    tag: string;
};

// Loader für die API-Key und das zuletzt generierte Wort
export const loader = async () => {
    try {
        // Holen des zuletzt generierten Wortes
        const wordsQuery = query(
                collection(db, "words"),
                orderBy("createdAt", "desc"), // Nach Erstellungsdatum sortieren
                limit(1) // Nur das neueste Wort abrufen
        );
        const querySnapshot = await getDocs(wordsQuery);
        const latestWord = querySnapshot.docs[0]?.data() as Word | undefined;

        return json({
            apiKey: process.env.OPENAI_API_KEY,
            latestWord: latestWord || null,
        });
    } catch (err) {
        console.error("Error fetching latest word:", err);
        return json({ apiKey: process.env.OPENAI_API_KEY, latestWord: null });
    }
};

export default function Index() {
    const { apiKey, latestWord } = useLoaderData<typeof loader>();
    const [customWord, setCustomWord] = useState("");
    const [excludedWords, setExcludedWords] = useState<string[]>([]);
    const [wordDetails, setWordDetails] = useState<Word | null>(latestWord);
    const [error, setError] = useState("");

    // Fetch all excluded words
    const fetchExcludedWords = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "words"));
            const words = querySnapshot.docs.map((doc) => doc.data().word);
            setExcludedWords(words);
        } catch (err) {
            console.error("Error fetching excluded words:", err);
        }
    };

    // Fetch a word from ChatGPT
    const fetchWordFromChatGPT = async (customInput: string | null) => {
        const excluded = excludedWords.join(", ");
        const systemMessage = generateSystemMessage("word", excluded);

        try {
            const data = await fetchChatGPT(apiKey, systemMessage, "system");
            const response = JSON.parse(data.choices[0].message.content);

            const newWord: Word = {
                word: response.word,
                definition: response.definition,
                example: response.example,
                date: new Date().toLocaleDateString("de-DE"),
                tag: customInput ? "custom" : "generated",
            };

            setWordDetails(newWord);

            // Speichern des neuen Worts in Firestore
            const id = newWord.word;
            await saveToFirestore("words", id, newWord);
        } catch (err) {
            setError("Error fetching word from ChatGPT.");
            console.error(err);
        }
    };

    useEffect(() => {
        fetchExcludedWords();
    }, []);

    return (
            <div className="container m-auto">
                <h1 className="text-2xl font-bold mb-4">Wort des Tages</h1>

                {wordDetails && (
                        <div className="mt-4 p-4 bg-gray-800">
                            <h2 className="text-lg font-semibold flex pb-2 justify-between">
                                {wordDetails.word}
                                <Badge className="ml-auto" variant="secondary">{wordDetails.tag}</Badge>
                            </h2>
                            <p>
                                <strong>Definition:</strong><br /> {wordDetails.definition}
                            </p>
                            <p>
                                <strong>Beispiel:</strong><br /> {wordDetails.example}
                            </p>
                        </div>
                )}

                <Button variant="secondary" onClick={() => fetchWordFromChatGPT(null)} className="mt-4">
                    Neues Wort generieren
                </Button>

                <div className="flex gap-4 mt-4">
                    <input
                            type="text"
                            value={customWord}
                            onChange={(e) => setCustomWord(e.target.value)}
                            placeholder="Enter a word"
                            className="border p-2 rounded"
                    />
                    <Button onClick={() => fetchWordFromChatGPT(customWord)}>Search Word</Button>
                </div>

                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
    );
}
