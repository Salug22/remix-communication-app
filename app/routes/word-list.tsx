import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { collection, getDocs } from "firebase/firestore";
import { deleteFirestoreDocument } from "~/helper/firestoreHelpers"; // Import der Löschfunktion
import db from "../firebase.config";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import React from "react";

// Typ für die geladenen Daten
type Word = {
    id: string; // Firestore-Dokument-ID
    word: string;
    definition: string;
    example: string;
    date: string;
    tag: string;
};

// Loader-Funktion: Lädt alle Wörter aus Firestore
export const loader = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "words"));
        const words: Word[] = querySnapshot.docs.map((doc) => ({
            id: doc.id, // Firestore-Dokument-ID speichern
            ...doc.data(),
        })) as Word[];

        return json({ words });
    } catch (error) {
        console.error("Error fetching words:", error);
        return json({ words: [], error: "Error fetching words" });
    }
};

// Hauptkomponente
export default function AllWords() {
    const { words: initialWords, error } = useLoaderData<typeof loader>();
    const [words, setWords] = React.useState<Word[]>(initialWords);

    if (error) {
        return <p className="text-red-500">Failed to load words: {error}</p>;
    }

    // Funktion zum Löschen eines Dokuments
    const handleDelete = async (id: string) => {
        try {
            await deleteFirestoreDocument("words", id); // Externe Löschfunktion verwenden
            setWords((prev) => prev.filter((word) => word.id !== id)); // Liste aktualisieren
        } catch (err) {
            console.error("Error deleting document:", err);
        }
    };

    return (
            <div className="container m-auto">
                <h1 className="text-2xl font-bold mb-4">All Words</h1>
                {words.length > 0 ? (
                        <Accordion type="multiple">
                            {words.map((word, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger>
                                            {word.word}
                                            {word.tag === "custom" && (
                                                    <Badge className="ml-auto" variant="primary">{word.tag}</Badge>
                                            )}
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <strong>Definition: </strong>
                                            <p>{word.definition}</p>
                                            <strong>Beispiel:</strong>
                                            <p>{word.example}</p>
                                            <div className="mt-4">
                                                <Button variant="destructive" onClick={() => handleDelete(word.id)}>
                                                    Löschen
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                            ))}
                        </Accordion>
                ) : (
                        <p>No words found.</p>
                )}
            </div>
    );
}
