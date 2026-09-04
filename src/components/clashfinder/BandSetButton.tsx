import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  addMinutes,
  isNeedTix,
  TIMELINE_OFFSET_PIXELS,
  timeToMinutes,
} from "../../utils/clashfinder";
import {
  getPDFById,
  getArtistSetTixCount,
  readFilesAsyncish,
  saveTixPerBand,
} from "../../utils/pdf";
import {
  getImageBlob,
  getImageTixCount,
  storeTicketImage,
  updateImageTixCountLSForArtist,
  getImageTixInfoFromLS,
} from "../../utils/img";
import type { BaybeatsSet, BaybeatsStage } from "../../types/types";
import { TixBadge } from "./TixBadge";
import cx from "../../utils/cx";

const haveTixClass = "from-lime-900 border-lime-700 border-1";
const noTixClass = "from-pink-700";
const dontNeedTixClass = "from-blue-400";

type BandSetButtonProps = {
  baybeatsSet: BaybeatsSet;
  stage: BaybeatsStage;
  minTime: number;
  pixelsPerMinute: number;
  setBandSetCount: Dispatch<SetStateAction<number | null>>;
  setRefreshWorkaround: Dispatch<SetStateAction<number>>;
  refreshWorkaround: number;
};

const BandSetButton = ({
  baybeatsSet,
  minTime,
  stage,
  pixelsPerMinute,
  refreshWorkaround,
  setRefreshWorkaround,
  setBandSetCount,
}: BandSetButtonProps) => {
  const { startTime, artist, note, setDurationMins } = baybeatsSet;
  const minsToAdd = setDurationMins ?? (stage === "Concourse" ? 30 : 45); // default to 30/45 mins set times
  const endTime = addMinutes(startTime, minsToAdd);
  const startMinutes = timeToMinutes(startTime);
  const topPosition =
    (startMinutes - minTime) * pixelsPerMinute + TIMELINE_OFFSET_PIXELS;
  const height = minsToAdd * pixelsPerMinute;

  const inputRef = useRef<HTMLInputElement>(null);
  const [tixCount, setTixCount] = useState<number>(0);
  const [ticketBlobLink, setTicketBlobLink] = useState<string>("");

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    let hasNewImage = false;
    let hasNewPdf = false;

    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        await storeTicketImage(file, artist, startTime);
        const existingImageTix = getImageTixInfoFromLS(artist, startTime);
        const newImageTix = [
          ...existingImageTix,
          { transactionNumber: file.name, tixCount: 1 },
        ];
        updateImageTixCountLSForArtist(artist, startTime, newImageTix);
        hasNewImage = true;
      } else if (file.type === "application/pdf") {
        hasNewPdf = true;
      }
    }

    if (hasNewPdf) {
      const pdfFiles = Array.from(files).filter(
        (f) => f.type === "application/pdf",
      );
      const dataTransfer = new DataTransfer();
      pdfFiles.forEach((f) => dataTransfer.items.add(f));
      const result = await readFilesAsyncish(dataTransfer.files);
      await saveTixPerBand(result);
    }

    if (hasNewImage || hasNewPdf) {
      console.log("triggered refresh workaround");
      setRefreshWorkaround(new Date().getTime());
    }
  };

  useEffect(() => {
    const initFn = async () => {
      const imageBlob = await getImageBlob(artist, startTime);
      if (imageBlob) {
        const url = URL.createObjectURL(imageBlob);
        setTicketBlobLink(url);
        setTixCount(getImageTixCount(artist, startTime));
      } else {
        const pdfBlobUrl = await getPDFById(artist);
        const url = pdfBlobUrl ? URL.createObjectURL(pdfBlobUrl) : "#";
        setTicketBlobLink(url);
        setTixCount(getArtistSetTixCount(artist));
      }
    };
    initFn();
  }, [artist, refreshWorkaround, startTime]);

  const needTix = isNeedTix(stage);

  return (
    <>
      <a
        href={ticketBlobLink}
        target="_blank"
        onClick={(e) => {
          if (tixCount === 0) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cx(
          "absolute left-1 right-1 bg-gradient-to-br to-lime-600 rounded-lg px-2 py-1 overflow-hidden hover:scale-105 hover:z-10 transition-transform cursor-pointer shadow-lg flex flex-col",
          needTix
            ? tixCount > 0
              ? haveTixClass
              : noTixClass
            : dontNeedTixClass,
        )}
        style={{
          top: `${topPosition}px`,
          height: `${height}px`,
        }}
      >
        <div className="text-white/80 font-bold text-[10px] mb-1">
          {startTime} - {endTime}
        </div>
        <div className="text-white font-semibold text-sm leading-tight grow">
          {artist}
        </div>
        {note && (
          <div className="text-white/80 text-xs italic leading-tight">
            {note}
          </div>
        )}
        {needTix && (
          <TixBadge
            setRefreshWorkaround={setRefreshWorkaround}
            setBandSetCount={setBandSetCount}
            tixCount={tixCount}
            setTixCount={setTixCount}
            artist={artist}
          />
        )}
      </a>
      <input
        hidden
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileChange}
      />
    </>
  );
};

export { BandSetButton };
