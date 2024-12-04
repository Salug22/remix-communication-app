import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { collection, getDocs } from "firebase/firestore";
import { deleteFirestoreDocument } from "~/helper/firestoreHelpers";
import db from "../firebase.config";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import {Button} from "~/components/ui/button";
import React from "react";

// Typ für die geladenen Daten
type Correction = {
    id: string; // Firestore-Dokument-ID
    correctedText: string;
    originalText: string;
    stylised: string;
    corrections: {
        error: string;
        suggestion: string;
    }[];
    date: string;
};

export const loader = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "corrections")); // Korrekturen-Sammlung abrufen
        const corrections: Correction[] = querySnapshot.docs.map((doc) => ({
            id: doc.id, // Firestore-Dokument-ID speichern
            ...doc.data(),
        })) as Correction[];

        return json({ corrections });
    } catch (error) {
        console.error("Error fetching corrections:", error);
        return json({ corrections: [], error: "Error fetching corrections" });
    }
};

// Hauptkomponente
export default function AllCorrections() {
    const { corrections: initialCorrections, error } = useLoaderData<typeof loader>();
    const [corrections, setCorrections] = React.useState<Correction[]>(initialCorrections);

    if (error) {
        return <p className="text-red-500">Failed to load corrections: {error}</p>;
    }

    // Funktion zum Löschen eines Dokuments
    const handleDelete = async (id: string) => {
        try {
            await deleteFirestoreDocument("corrections", id); // Externe Löschfunktion verwenden
            setCorrections((prev) => prev.filter((correction) => correction.id !== id)); // Liste aktualisieren
        } catch (err) {
            console.error("Error deleting document:", err);
        }
    };

    return (
            <div className="container m-auto">
                <h1 className="text-2xl font-bold mb-4">Alle Korrigierten Texte</h1>
                {corrections.length > 0 ? (
                        <Accordion type="multiple">
                            {corrections.map((correction, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger>
                                            {correction.correctedText}
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <p className="mb-2">
                                                <strong>Original:</strong> <br/>{correction.originalText}
                                            </p>
                                            <p className="mb-2">
                                                <strong>Korrigierter Text:</strong> <br/> {correction.correctedText}
                                            </p>
                                            {correction.stylised && (
                                                    <p className="mb-2">
                                                        <strong>Stilisiert:</strong> {correction.stylised}
                                                    </p>
                                            )}
                                            <h3 className="text-lg font-semibold mt-4">Fehleranalyse:</h3>
                                            <ul className="list-disc pl-6">
                                                {correction.corrections.length > 0 ? (
                                                        correction.corrections.map((item, itemIndex) => (
                                                                <li key={itemIndex} className="mt-2">
                                                                    <strong>Fehler:</strong> {item.error}<br/>
                                                                    <strong>Vorschlag:</strong> {item.suggestion}
                                                                </li>
                                                        ))
                                                ) : (
                                                        <li>Keine Fehler gefunden.</li>
                                                )}
                                            </ul>
                                            <div className="mt-4">
                                                <Button variant="destructive"
                                                        onClick={() => handleDelete(correction.id)}>
                                                    Löschen
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                            ))}
                        </Accordion>
                ) : (
                        <p>No corrections found.</p>
                )}
            </div>
    );
}
