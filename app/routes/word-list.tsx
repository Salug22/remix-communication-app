import {json} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import {collection, getDocs} from "firebase/firestore";
import db from "../firebase.config";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "~/components/ui/accordion";
import {Badge} from "~/components/ui/badge";

// Typ für die geladenen Daten
type Word = {
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
        const words: Word[] = querySnapshot.docs.map((doc) => doc.data() as Word);

        return json({words});
    } catch (error) {
        console.error("Error fetching words:", error);
        return json({words: [], error: "Error fetching words"});
    }
};

// Hauptkomponente
export default function AllWords() {
    const {words, error} = useLoaderData<typeof loader>();

    if (error) {
        return <p className="text-red-500">Failed to load words: {error}</p>;
    }

    return (
            <div className="container m-auto">
                <h1 className="text-2xl font-bold mb-4">All Words</h1>
                {words.length > 0 ? (
                                <>
                                    {words.map((word, index) => (
                                            <Accordion key={index} type="single" collapsible>
                                                <AccordionItem value="item-1">
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
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                    ))}
                                </>
                        )
                        :
                        (
                                <p>No words found.</p>
                        )
                }
            </div>
    );
}
