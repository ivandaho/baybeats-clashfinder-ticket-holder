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
  return (
    <div className="App w-screen">
      <div className="flex lg:justify-center">
        <ClashFinder />
      </div>
    </div>
  );
}

export default App;
