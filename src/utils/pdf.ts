import { openDB } from "idb";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import type {
  BaybeatsStage,
  SetMetadata,
  UniqTixCountFormat,
} from "../types/types";
import { PDFDocument } from "pdf-lib";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const dbPromise = await openDB("pdf-files", 1, {
  upgrade(db) {
    db.createObjectStore("pdf-files");
  },
});

const textBeforeBandName = "Esplanade Presents | Baybeats  ";
const textAfterBandName = "  The Esplanade Co Ltd";
const venueAnnexe = "Annexe (Esplanade Annexe Studio)";
const venueWaterfront =
  "Powerhouse2 (Singtel Waterfront  Theatre at Esplanade)";

const bandSetDateTimeRegexp = new RegExp(
  /\d\d-[A-Z]\w\w-\d\d\d\d \d\d:\d\d (AM|PM)/,
);

const transNumRegExp = new RegExp(/(\d{8}-\d{6})/g);

const processPdfData = (fullText: string, numPages: number): SetMetadata => {
  return {
    bandName: getBandName(fullText),
    bandSetDateTime: getSetDateTime(fullText),
    stageLocation: getStageLocation(fullText),
    tixCount: getTixCount(numPages),
    transactionNumber: getTransNums(fullText),
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

// returns the transaction number for the pdf file ticket
const getTransNums = (fullText: string): string => {
  const matches = [...fullText.matchAll(transNumRegExp)];

  return matches.map((match) => match[0])[0];
};

const countryRegexp = new RegExp(/\(\w\w\)$/);
const getCleanBandName = (bandName: string) =>
  bandName.replace(countryRegexp, "").trim().replaceAll(" ", "-");

const storeTicketPdf = async (file: File, bandName: string) => {
  const cleanedBandName = getCleanBandName(bandName);
  try {
    await dbPromise.put("pdf-files", file, cleanedBandName);
    console.log(`Stored ${cleanedBandName} tix in IndexedDB`);
    return true;
  } catch (error) {
    console.error(`Failed to store ${cleanedBandName} tix in IndexedDB`, error);
    return false;
  }
};

const deleteTicketPdf = async (id: string) => {
  try {
    await dbPromise.delete("pdf-files", getCleanBandName(id));
    console.log(`deleted ${id} tix in IndexedDB`);
    return true;
  } catch (error) {
    console.error(`Failed to deleted ${id} tix in IndexedDB`, error);
    return false;
  }
};

const getStoredPdfCount = async (): Promise<number> => {
  return await dbPromise.count("pdf-files");
};

const getPDFById = async (id: string): Promise<Blob> => {
  return await dbPromise.get("pdf-files", getCleanBandName(id));
};

const removeAllPDFData = async (): Promise<boolean> => {
  try {
    await dbPromise.clear("pdf-files");
    return true;
  } catch (e: any) {
    return false;
  }
};

const getArtistSetTixCount = (artist: string): number => {
  let tixCounter = 0;
  let data: UniqTixCountFormat[] = [];
  try {
    data = JSON.parse(localStorage.getItem(getCleanBandName(artist)) || "");
  } catch (e) {
    // invalid data
  }
  data.forEach((d) => {
    tixCounter += d.tixCount;
  });
  return tixCounter;
};

const updateTixCountLSForArtist = (
  artist: string,
  tixCount: UniqTixCountFormat[],
) => {
  // update artist set tix count and total tix count
  const cleanedArtistName = getCleanBandName(artist);
  JSON.stringify(tixCount);
  localStorage.setItem(cleanedArtistName, JSON.stringify(tixCount));
};

const removeArtistTixInfoFromLS = (artist: string) => {
  const cleanedArtistName = getCleanBandName(artist);
  localStorage.removeItem(cleanedArtistName);
};

const readFilesAsyncish = async (files: FileList) => {
  return new Promise<FileObjectMap2>((resolve, reject) => {
    const obj: FileObjectMap2 = {};
    let index = 0;
    for (const file of files) {
      let reader = new FileReader();

      reader.onload = async () => {
        console.log("reader.result: ", reader.result);
        // read pdf, store info, whatever
        const loadingTask = pdfjsLib.getDocument(reader.result as ArrayBuffer);
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

        if (!obj[setMetadata.bandName]) {
          obj[setMetadata.bandName] = [{ setMetadata, tix: file }];
        } else {
          obj[setMetadata.bandName] = [
            ...obj[setMetadata.bandName],
            { setMetadata, tix: file },
          ];
        }
        index++;
        if (index >= files.length) {
          resolve(obj);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    }
  });
};

type FileObjectMap2 = {
  [x: string]: { setMetadata: SetMetadata; tix: File }[];
};

const saveTixPerBand = async (obj: FileObjectMap2) => {
  const items = Object.entries(obj);
  for (const [bandName, tixInfos] of items) {
    const combinedPdf = await PDFDocument.create();
    let tixCount: { transactionNumber: string; tixCount: number }[] = [];
    await Promise.all(
      tixInfos.map(async ({ setMetadata, tix }) => {
        if (!tix) return;
        // Read the file as ArrayBuffer
        const arrayBuffer = await tix.arrayBuffer();
        // Load the PDF
        const pdf = await PDFDocument.load(arrayBuffer);
        // Copy all pages from this PDF
        const pages = await combinedPdf.copyPages(pdf, pdf.getPageIndices());
        // Add each page to the combined PDF
        pages.forEach((page) => combinedPdf.addPage(page));
        tixCount = [
          ...tixCount,
          {
            transactionNumber: setMetadata.transactionNumber,
            tixCount: setMetadata.tixCount,
          },
        ];
      }),
    );
    const combinedPdfBytes = await combinedPdf.save();
    const combinedFile = new File([combinedPdfBytes as any], "combined.pdf", {
      type: "application/pdf",
    });
    await storeTicketPdf(combinedFile, bandName);

    updateTixCountLSForArtist(bandName, tixCount);
  }
  return true;
};

export {
  deleteTicketPdf,
  getArtistSetTixCount,
  getBandName,
  getPDFById,
  getSetDateTime,
  getStageLocation,
  getStoredPdfCount,
  getTixCount,
  processPdfData,
  readFilesAsyncish,
  removeAllPDFData,
  removeArtistTixInfoFromLS,
  saveTixPerBand,
  storeTicketPdf,
};
