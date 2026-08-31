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
const inConjunctionText = "presented in conjunction with Carnival Fever";
const venueAnnexe = "Annexe (Esplanade Annexe Studio)";
const venueWaterfront =
  "Powerhouse2 (Singtel Waterfront  Theatre at Esplanade)";

const bandSetDateTimeRegexp = new RegExp(
  /\d\d-[A-Z]\w\w-\d\d\d\d \d\d:\d\d (AM|PM)/,
);

const transNumRegExp = new RegExp(/(\d{8}-\d{6})/g);

const bandNameFixes: { [s: string]: string } = {
  "R ắ n C ạ p   Đ uôi Collective": "Rắn Cạp Đuôi Collective",
};

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
  const fixedFullText = fullText.replace(inConjunctionText, "");
  const startIndex =
    fixedFullText.indexOf(textBeforeBandName) + textBeforeBandName.length;
  const endIndex = fixedFullText.indexOf(textAfterBandName);
  const bandName = fixedFullText.substring(startIndex, endIndex);
  return bandNameFixes[bandName] || bandName;
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

const getArtistTixInfoFromLS = (artist: string): UniqTixCountFormat[] => {
  const cleanedArtistName = getCleanBandName(artist);
  const item = localStorage.getItem(cleanedArtistName);
  if (!item) {
    return [];
  }
  try {
    const parsedItem = JSON.parse(item);
    if (Array.isArray(parsedItem)) {
      return parsedItem;
    }
  } catch (e) {
    // ignore invalid json
  }
  return [];
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
      const reader = new FileReader();

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
    // de-duplicate the uploaded batch first
    const uniqueTixInfosInUpload = Array.from(
      tixInfos
        .reduce((map, item) => {
          map.set(item.setMetadata.transactionNumber, item);
          return map;
        }, new Map())
        .values(),
    );

    const existingTixInfo = getArtistTixInfoFromLS(bandName);
    const existingTixInfoTxNumbers = existingTixInfo.map(
      (t) => t.transactionNumber,
    );
    const newTixInfo = uniqueTixInfosInUpload.filter(
      (t) =>
        !existingTixInfoTxNumbers.includes(t.setMetadata.transactionNumber),
    );

    if (newTixInfo.length === 0) {
      continue;
    }

    const combinedPdf = await PDFDocument.create();
    const existingPdfBlob = await getPDFById(bandName);
    if (existingPdfBlob) {
      const pdf = await PDFDocument.load(await existingPdfBlob.arrayBuffer());
      const pages = await combinedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => combinedPdf.addPage(page));
    }

    let tixCount: { transactionNumber: string; tixCount: number }[] = [
      ...existingTixInfo,
    ];
    await Promise.all(
      newTixInfo.map(async ({ setMetadata, tix }) => {
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

const UPLOAD_URL = "/upload";

// Splits a multi-page ticket PDF into one PDF per individual ticket.
// Each ticket in the source PDF spans 2 pages (front + back), so pages are
// grouped in pairs and each pair is emitted as its own single-ticket File.
const splitPdfByTix = async (
  pdfBytes: ArrayBuffer,
  filename: string,
): Promise<File[]> => {
  const pdf = await PDFDocument.load(pdfBytes);
  const pageIndices = pdf.getPageIndices();
  const tixFiles: File[] = [];

  for (let i = 0; i < pageIndices.length; i += 2) {
    const tixDoc = await PDFDocument.create();
    const pages = await tixDoc.copyPages(pdf, pageIndices.slice(i, i + 2));
    pages.forEach((page) => tixDoc.addPage(page));
    const bytes = await tixDoc.save();
    tixFiles.push(
      new File([bytes as any], `${filename}-tix-${i / 2 + 1}.pdf`, {
        type: "application/pdf",
      }),
    );
  }

  return tixFiles;
};

type TixUpload = { bandName: string; file: File };

// Splits every uploaded PDF in the map into individual tickets, one entry per
// ticket with its band name. Each file maps to an Express.Multer.File on the
// server once sent via FormData.
const splitTixPerBand = async (obj: FileObjectMap2): Promise<TixUpload[]> => {
  const items = Object.entries(obj);
  const uploads: TixUpload[] = [];

  for (const [bandName, tixInfos] of items) {
    // de-duplicate the uploaded batch by transaction number first
    const uniqueTixInfosInUpload = Array.from(
      tixInfos
        .reduce((map, item) => {
          map.set(item.setMetadata.transactionNumber, item);
          return map;
        }, new Map())
        .values(),
    );

    const cleanBandName = getCleanBandName(bandName);
    for (const { tix } of uniqueTixInfosInUpload) {
      if (!tix) continue;
      // split this PDF into one File per individual ticket
      const singleTixFiles = await splitPdfByTix(
        await tix.arrayBuffer(),
        cleanBandName,
      );
      singleTixFiles.forEach((file) => uploads.push({ bandName, file }));
    }
  }

  return uploads;
};

const postTixToServer = async (uploads: TixUpload[]) => {
  const formData = new FormData();
  uploads.forEach(({ bandName, file }) => {
    formData.append("file", file);
    formData.append("bandName", bandName);
  });
  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`upload failed: ${response.status} ${response.statusText}`);
  }
  return uploads;
};

const migrateLegacyData = async () => {
  const allDbKeys = await dbPromise.getAllKeys("pdf-files");
  for (const key of allDbKeys) {
    const pdfBlob = await dbPromise.get("pdf-files", key);
    if (!pdfBlob) {
      continue;
    }
    const loadingTask = pdfjsLib.getDocument(await pdfBlob.arrayBuffer());
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
    const { bandName, tixCount, transactionNumber } = setMetadata;
    const cleanedBandName = getCleanBandName(bandName);
    const newLSValue = [{ tixCount, transactionNumber }];
    localStorage.setItem(cleanedBandName, JSON.stringify(newLSValue));
  }
  localStorage.removeItem("tixCount");
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
  splitTixPerBand,
  getArtistTixInfoFromLS,
  migrateLegacyData,
  postTixToServer,
};
