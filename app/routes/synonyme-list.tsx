import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { collection, getDocs } from "firebase/firestore";
import db from "../firebase.config";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";

// Typ für die geladenen Daten
type Synonym = {
    word: string; // Das ursprüngliche Wort
    synonym: string; // Das generierte Synonym
    date: string; // Datum der Erstellung
};

// Loader-Funktion: Lädt alle Synonyme aus Firestore
export const loader = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "synonyms")); // Synonyme-Sammlung abrufen
        const synonyms: Synonym[] = querySnapshot.docs.map((doc) => doc.data() as Synonym);

        return json({ synonyms });
    } catch (error) {
        console.error("Error fetching synonyms:", error);
        return json({ synonyms: [], error: "Error fetching synonyms" });
    }
};

// Hauptkomponente
export default function AllSynonyms() {
    const { synonyms, error } = useLoaderData<typeof loader>();

    if (error) {
        return <p className="text-red-500">Failed to load synonyms: {error}</p>;
    }

    return (
            <div className="container m-auto">
                <h1 className="text-2xl font-bold mb-4">All Synonyms</h1>
                {synonyms.length > 0 ? (
                        <>
                            {synonyms.map((synonym, index) => (
                                    <Accordion key={index} type="single" collapsible>
                                        <AccordionItem value={`item-${index}`}>
                                            <AccordionTrigger>
                                                {synonym.word}
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <p>
                                                    <strong>Synonym:</strong><p>{synonym.synonym}</p>
                                                </p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                            ))}
                        </>
                ) : (
                        <p>No synonyms found.</p>
                )}
            </div>
    );
}
