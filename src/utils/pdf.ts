import { openDB } from "idb";
import type { BaybeatsStage, SetMetadata } from "../types/types";

const dbPromise = openDB("pdf-store", 1, {
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

const countryRegexp = new RegExp(/\(\w\w\)$/);
const getCleanBandName = (bandName: string) =>
  bandName.replace(countryRegexp, "").trim().replaceAll(" ", "-");

const storeTicketPdf = async (file: File, bandName: string) => {
  const cleanedBandName = getCleanBandName(bandName);
  try {
    const db = await dbPromise;
    await db.put("pdf-files", file, cleanedBandName);
    console.log(`Stored ${cleanedBandName} tix in IndexedDB`);
    return true;
  } catch (error) {
    console.error(`Failed to store ${cleanedBandName} tix in IndexedDB`, error);
    return false;
  }
};

const deleteTicketPdf = async (id: string) => {
  try {
    const db = await dbPromise;
    await db.delete("pdf-files", getCleanBandName(id));
    console.log(`deleted ${id} tix in IndexedDB`);
    return true;
  } catch (error) {
    console.error(`Failed to deleted ${id} tix in IndexedDB`, error);
    return false;
  }
};

export const getIfPDFExists = async (id: string) => {
  const db = await dbPromise;
  const f = getCleanBandName(id);
  return (await db.count("pdf-files", f)) > 0;
};

export const getPDFById = async (id: string) => {
  const db = await dbPromise;
  return await db.get("pdf-files", getCleanBandName(id));
};

export {
  processPdfData,
  getBandName,
  getSetDateTime,
  getStageLocation,
  getTixCount,
  storeTicketPdf,
  deleteTicketPdf,
};
