import { json, MetaFunction } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import db from "../firebase.config";
import { useLoaderData } from "@remix-run/react";

// Meta information for the page
export const meta: MetaFunction = () => {
    return [
        { title: "ChatGPT Integration" },
        { name: "description", content: "Generate and store words using ChatGPT." },
    ];
};

// Loader to fetch server-side environment variables
export const loader = async () => {
    return json({
        apiKey: process.env.OPENAI_API_KEY,
    });
};

// Main Component
export default function Index() {
    const { apiKey } = useLoaderData<typeof loader>(); // Access the API key from loader

    const [word, setWord] = useState("");
    const [definition, setDefinition] = useState("");
    const [example, setExample] = useState("");
    const [customWord, setCustomWord] = useState("");
    const [excludedWords, setExcludedWords] = useState<string[]>([]);
    const [error, setError] = useState("");

    // Fetch all excluded words from Firestore
    const fetchExcludedWords = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "excludedWords"));
            const words: string[] = [];
            querySnapshot.forEach((doc) => {
                words.push(doc.data().word);
            });
            setExcludedWords(words);
        } catch (err) {
            console.error("Error fetching excluded words:", err);
        }
    };

    // Save a word to Firestore
    const saveWordToFirestore = async (newWord: any) => {
        try {
            await setDoc(doc(db, "words", newWord.word), {
                ...newWord,
                createdAt: new Date(),
            });
            setExcludedWords((prev) => [...prev, newWord.word]);
        } catch (err) {
            console.error("Error saving word:", err);
        }
    };

    // Fetch a new word using ChatGPT
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
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        systemMessage,
                        { role: "user", content: term },
                    ],
                }),
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);
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
        } catch (err: any) {
            console.error("Error fetching word:", err.message);
            setError("An error occurred. Please try again.");
        }
    };

    // Fetch excluded words on component mount
    useEffect(() => {
        fetchExcludedWords();
    }, []);

    return (
            <div className="flex flex-col items-center gap-8 p-4">
                <header>
                    <h1 className="text-2xl font-bold">ChatGPT Integration</h1>
                </header>

                {/* Generate a new word */}
                <Button onClick={() => fetchWord(null)}>Generate New Word</Button>

                {/* Search for a custom word */}
                <div className="flex gap-4">
                    <input
                            type="text"
                            value={customWord}
                            onChange={(e) => setCustomWord(e.target.value)}
                            placeholder="Enter a word"
                            className="border p-2 rounded"
                    />
                    <Button onClick={() => fetchWord(customWord)}>Search Word</Button>
                </div>

                {/* Display the result */}
                {word && (
                        <div className="mt-4">
                            <h2 className="text-lg font-semibold">Word: {word}</h2>
                            <p>
                                <strong>Definition:</strong> {definition}
                            </p>
                            <p>
                                <strong>Example:</strong> {example}
                            </p>
                        </div>
                )}

                {/* Display any errors */}
                {error && <p className="text-red-500">{error}</p>}
            </div>
    );
}
