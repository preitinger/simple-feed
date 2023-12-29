'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        const setupId = localStorage.getItem('setupId');
        if (setupId == null) return;
        router.replace(`/feed/${setupId}`);
    }, [router]);

    return (
        <div>
            <h1>simple-feeds</h1>
            <p>
                In diesem Projekt wird ein vereinfachter News Feed implementiert. Ziel ist es, Informationen für Personen bereit zu stellen, die Schwierigkeiten haben, Apps wie Facebook oder Whatsapp zu bedienen, aber dennoch die Möglichkeit erhalten sollen, digital mit Neuigkeiten versorgt werden zu können.
            </p>

            <p>
                Hier ist die einfache Ansicht zu einem <Link href='/feed/test'>Testfeed</Link>. Dort benötigtes Passwort: abc

            </p>
            <p>
                Hier wäre die Seite zum <Link href='/feed/test/addEntry'>Hinzufügen eines Feeds</Link> um eine Information für den Betrachter bereitzustellen
            </p>
            <p>
                Hier ist die <Link href='/admin'>Administrationsseite</Link> zum Erzeugen neuer Feeds (geschützt mit Admin-Passwort, das hier nicht veröffentlicht wird) oder zum Ändern bestehender. Aus Zeitgründen ist diese Seite leider nicht besonders benutzerfreundlich. ;-)
            </p>
            <p>
                Hier kann man einen Feed so <Link href='/setup'>einrichten</Link>, dass er beim Start dieser Webapp angezeigt wird.
            </p>
        </div>
    )
}