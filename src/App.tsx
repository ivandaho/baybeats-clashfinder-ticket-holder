import { type ChangeEvent } from "react";
import "./App.css";
import { openDB } from "idb";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { type BaybeatsStage, type SetMetadata } from "./types/types";
import ClashFinder from "./components/clashfinder/Clashfinder";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const textBeforeBandName = "Esplanade Presents | Baybeats  ";
const textAfterBandName = "  The Esplanade Co Ltd";
const venueAnnexe = "Annexe (Esplanade Annexe Studio)";
const venueWaterfront =
  "Powerhouse2 (Singtel Waterfront  Theatre at Esplanade)";

const bandSetDateTimeRegexp = new RegExp(
  /\d\d-[A-Z]\w\w-\d\d\d\d \d\d:\d\d (AM|PM)/,
);

const dbPromise = openDB("pdf-store", 1, {
  upgrade(db) {
    db.createObjectStore("pdf-files");
  },
});

function App() {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          try {
            const loadingTask = pdfjsLib.getDocument(
              e.target.result as ArrayBuffer,
            );
            const pdf = await loadingTask.promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item) => (item as any).str)
                .join(" ");
              fullText += pageText;
            }

            const setMetadata = processPdfData(fullText, pdf.numPages);
            console.log("d: ", setMetadata);
            const bandName = setMetadata.bandName;
            localStorage.setItem(
              `set-${bandName}`,
              JSON.stringify(setMetadata),
            );
            storeTicketPdf(file, setMetadata.bandName);
          } catch (error) {
            console.error("Error processing PDF:", error);
          }
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  // test
  // useEffect(() => {
  //   const mockText =
  //     "* Each ticket admits one person.  * Due to the nature of the performance, loud sounds, strobe lights and coarse language may be used.  * Young audiences are strongly encouraged to wear noise-reducing headphones.  * Ticketholders are advised to arrive at the venue early, as unutilised tickets may be offered to walk-in patrons,  on a first-come, first-served basis once the performance has started. This will enable as many people as  possible to join us for this free performance.  * Ticketholders who leave the venue during the performance will have to join the queue for walk-in patrons in  order to re-enter the venue.  * If you are unable to join us, you may pass the e-ticket to someone else or return your tickets via the link on  your SISTIC confirmation email.  Enjoy great deals at   Esplanade Mall  Ticket Type  E&Me Priority  Cat 1  Ticket Price  SGD 0  Price excludes booking fee  Esplanade Presents | Baybeats  paranoid void  The Esplanade Co Ltd  01-Nov-2025 10:40 PM  Powerhouse2 (Singtel Waterfront  Theatre at Esplanade)  Free Seating  Patron Name  Ivan Ho   Transaction No.  20251016-001545  SISTIC Terms and Conditions  Venue Terms and Conditions  Harry's  Esplanade&Me members save 10%  The Band World  Esplanade&Me members save 5%  Subway  Show your ticket and enjoy exclusive Subway  offers at Esplanade Mall!* Each ticket admits one person.  * Due to the nature of the performance, loud sounds, strobe lights and coarse language may be used.  * Young audiences are strongly encouraged to wear noise-reducing headphones.  * Ticketholders are advised to arrive at the venue early, as unutilised tickets may be offered to walk-in patrons,  on a first-come, first-served basis once the performance has started. This will enable as many people as  possible to join us for this free performance.  * Ticketholders who leave the venue during the performance will have to join the queue for walk-in patrons in  order to re-enter the venue.  * If you are unable to join us, you may pass the e-ticket to someone else or return your tickets via the link on  your SISTIC confirmation email.  Enjoy great deals at   Esplanade Mall  Ticket Type  E&Me Priority  Cat 1  Ticket Price  SGD 0  Price excludes booking fee  Esplanade Presents | Baybeats  paranoid void  The Esplanade Co Ltd  01-Nov-2025 10:40 PM  Powerhouse2 (Singtel Waterfront  Theatre at Esplanade)  Free Seating  Patron Name  Ivan Ho   Transaction No.  20251016-001545  SISTIC Terms and Conditions  Venue Terms and Conditions  Harry's  Esplanade&Me members save 10%  The Band World  Esplanade&Me members save 5%  Subway  Show your ticket and enjoy exclusive Subway  offers at Esplanade Mall!";
  //
  //   const mt2 =
  //     "* Each ticket admits one person.  * Due to the nature of the performance, loud sounds, strobe lights and coarse language may be used.  * Young audiences are strongly encouraged to wear noise-reducing headphones.  * Ticketholders are advised to arrive at the venue early, as unutilised tickets may be offered to walk-in patrons,  on a first-come, first-served basis once the performance has started. This will enable as many people as  possible to join us for this free performance.  * Ticketholders who leave the venue during the performance will have to join the queue for walk-in patrons in  order to re-enter the venue.  * If you are unable to join us, you may pass the e-ticket to someone else or return your tickets via the link on  your SISTIC confirmation email.  Enjoy great deals at   Esplanade Mall  Ticket Type  E&Me Priority  Cat 1  Ticket Price  SGD 0  Price excludes booking fee  Esplanade Presents | Baybeats  FORD TRIO  The Esplanade Co Ltd  01-Nov-2025 06:30 PM  Annexe (Esplanade Annexe Studio)  Free Standing  Patron Name  Ivan Ho   Transaction No.  20251016-001829  SISTIC Terms and Conditions  Venue Terms and Conditions  Harry's  Esplanade&Me members save 10%  The Band World  Esplanade&Me members save 5%  Subway  Show your ticket and enjoy exclusive Subway  offers at Esplanade Mall!* Each ticket admits one person.  * Due to the nature of the performance, loud sounds, strobe lights and coarse language may be used.  * Young audiences are strongly encouraged to wear noise-reducing headphones.  * Ticketholders are advised to arrive at the venue early, as unutilised tickets may be offered to walk-in patrons,  on a first-come, first-served basis once the performance has started. This will enable as many people as  possible to join us for this free performance.  * Ticketholders who leave the venue during the performance will have to join the queue for walk-in patrons in  order to re-enter the venue.  * If you are unable to join us, you may pass the e-ticket to someone else or return your tickets via the link on  your SISTIC confirmation email.  Enjoy great deals at   Esplanade Mall  Ticket Type  E&Me Priority  Cat 1  Ticket Price  SGD 0  Price excludes booking fee  Esplanade Presents | Baybeats  FORD TRIO  The Esplanade Co Ltd  01-Nov-2025 06:30 PM  Annexe (Esplanade Annexe Studio)  Free Standing  Patron Name  Ivan Ho   Transaction No.  20251016-001829  SISTIC Terms and Conditions  Venue Terms and Conditions  Harry's  Esplanade&Me members save 10%  The Band World  Esplanade&Me members save 5%  Subway  Show your ticket and enjoy exclusive Subway  offers at Esplanade Mall!";
  //   processPdfData(mt2);
  // }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>PDF Processor</h1>
        <input type="file" multiple accept=".pdf" onChange={handleFileChange} />
      </header>
      <ClashFinder />
    </div>
  );
}

const processPdfData = (fullText: string, numPages: number): SetMetadata => {
  return {
    bandName: getBandName(fullText),
    bandSetDateTime: getSetDateTime(fullText),
    stageLocation: getStageLocation(fullText),
    tixCount: getTixCount(numPages),
  };
};

const getBandName = (fullText: string): string => {
  const startIndex =
    fullText.indexOf(textBeforeBandName) + textBeforeBandName.length;
  const endIndex = fullText.indexOf(textAfterBandName);
  const bandName = fullText.substring(startIndex, endIndex);
  return bandName;
};

const getSetDateTime = (fullText: string): Date => {
  const match = fullText.match(bandSetDateTimeRegexp);
  if (match) {
    const dateStr = match[0]; // "01-Nov-2025 10:40 PM"
    return new Date(dateStr);
  }
  throw new Error("no date found in text!");
};

const getStageLocation = (fullText: string): BaybeatsStage => {
  if (fullText.indexOf(venueAnnexe)) {
    return "Annexe";
  } else if (fullText.indexOf(venueWaterfront)) {
    return "Powerhouse";
  } else {
    return "Unknown";
  }
};

const getTixCount = (numPages: number): number => {
  return Math.floor(numPages / 2);
};

const storeTicketPdf = async (file: File, bandName: string) => {
  try {
    const db = await dbPromise;
    await db.put("pdf-files", file, bandName);
    console.log(`Stored ${bandName} tix in IndexedDB`);
  } catch (error) {
    console.error(`Failed to store ${bandName} tix in IndexedDB`, error);
  }
};

export default App;
