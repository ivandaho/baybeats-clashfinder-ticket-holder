import { openDB } from "idb";
import type { UniqTixCountFormat } from "../types/types";

const dbPromise = await openDB("image-files", 1, {
  upgrade(db) {
    db.createObjectStore("image-files");
  },
});

const countryRegexp = new RegExp(/\(\w\w\)$/);
const getCleanBandName = (bandName: string) =>
  bandName.replace(countryRegexp, "").trim().replaceAll(" ", "-");

const getImageKey = (bandName: string, startTime: string) =>
  `${getCleanBandName(bandName)}-${startTime}`;

const storeTicketImage = async (
  file: File,
  bandName: string,
  startTime: string,
) => {
  const imageKey = getImageKey(bandName, startTime);
  try {
    await dbPromise.put("image-files", file, imageKey);
    console.log(`Stored ${imageKey} image in IndexedDB`);
    return true;
  } catch (error) {
    console.error(`Failed to store ${imageKey} image in IndexedDB`, error);
    return false;
  }
};

const deleteTicketImage = async (bandName: string, startTime: string) => {
  const imageKey = getImageKey(bandName, startTime);
  try {
    await dbPromise.delete("image-files", imageKey);
    console.log(`deleted ${imageKey} image in IndexedDB`);
    return true;
  } catch (error) {
    console.error(`Failed to deleted ${imageKey} image in IndexedDB`, error);
    return false;
  }
};

const getImageBlob = async (
  bandName: string,
  startTime: string,
): Promise<Blob> => {
  const imageKey = getImageKey(bandName, startTime);
  return await dbPromise.get("image-files", imageKey);
};

const getImageTixCount = (artist: string, startTime: string): number => {
  let tixCounter = 0;
  let data: UniqTixCountFormat[] = [];
  const imageKey = getImageKey(artist, startTime);
  try {
    data = JSON.parse(localStorage.getItem(`image-${imageKey}`) || "");
  } catch (e) {
    // invalid data
  }
  data.forEach((d) => {
    tixCounter += d.tixCount;
  });
  return tixCounter;
};

const getImageTixInfoFromLS = (
  artist: string,
  startTime: string,
): UniqTixCountFormat[] => {
  const imageKey = getImageKey(artist, startTime);
  const item = localStorage.getItem(`image-${imageKey}`);
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

const updateImageTixCountLSForArtist = (
  artist: string,
  startTime: string,
  tixCount: UniqTixCountFormat[],
) => {
  const imageKey = getImageKey(artist, startTime);
  localStorage.setItem(`image-${imageKey}`, JSON.stringify(tixCount));
};

const removeAllImageData = async (): Promise<boolean> => {
  try {
    await dbPromise.clear("image-files");
    return true;
  } catch (e: any) {
    return false;
  }
};

export {
  deleteTicketImage,
  getImageBlob,
  getImageTixCount,
  getImageTixInfoFromLS,
  storeTicketImage,
  updateImageTixCountLSForArtist,
  removeAllImageData,
};
