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
type Synonym = {
    id: string; // Firestore-Dokument-ID
    word: string; // Das ursprüngliche Wort
    synonym: string; // Das generierte Synonym
    date: string; // Datum der Erstellung
};

// Loader-Funktion: Lädt alle Synonyme aus Firestore
export const loader = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "synonyms")); // Synonyme-Sammlung abrufen
        const synonyms: Synonym[] = querySnapshot.docs.map((doc) => ({
            id: doc.id, // Firestore-Dokument-ID speichern
            ...doc.data(),
        })) as Synonym[];

        return json({ synonyms });
    } catch (error) {
        console.error("Error fetching synonyms:", error);
        return json({ synonyms: [], error: "Error fetching synonyms" });
    }
};

// Hauptkomponente
export default function AllSynonyms() {
    const { synonyms: initialSynonyms, error } = useLoaderData<typeof loader>();
    const [synonyms, setSynonyms] = React.useState<Synonym[]>(initialSynonyms);

    if (error) {
        return <p className="text-red-500">Failed to load synonyms: {error}</p>;
    }

    // Funktion zum Löschen eines Dokuments
    const handleDelete = async (id: string) => {
        try {
            await deleteFirestoreDocument("synonyms", id); // Externe Löschfunktion verwenden
            setSynonyms((prev) => prev.filter((synonym) => synonym.id !== id)); // Liste aktualisieren
        } catch (err) {
            console.error("Error deleting document:", err);
        }
    };

    return (
            <div className="container m-auto">
                <h1 className="text-2xl font-bold mb-4">All Synonyms</h1>
                {synonyms.length > 0 ? (
                        <Accordion type="multiple">
                            {synonyms.map((synonym, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger>
                                            {synonym.word}
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <p>
                                                <strong>Synonym:</strong>
                                                <p>{synonym.synonym}</p>
                                            </p>
                                            <div className="mt-4">
                                                <Button variant="destructive" onClick={() => handleDelete(synonym.id)}>
                                                    Löschen
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                            ))}
                        </Accordion>
                ) : (
                        <p>No synonyms found.</p>
                )}
            </div>
    );
}
