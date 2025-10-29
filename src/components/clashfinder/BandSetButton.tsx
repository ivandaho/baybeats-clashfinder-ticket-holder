import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { addMinutes, isNeedTix, timeToMinutes } from "../../utils/clashfinder";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import {
  getArtistSetTixCount,
  getIfPDFExists,
  getPDFById,
  processPdfData,
  storeTicketPdf,
  updateTixCountLSForArtist,
} from "../../utils/pdf";
import cx from "classnames";
import type { BaybeatsSet, BaybeatsStage } from "../../types/types";
import { TixBadge } from "./TixBadge";
import { useLongPress } from "@uidotdev/usehooks";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const haveTixClass = "from-indigo-900";
const noTixClass = "from-pink-500";
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
  const { startTime, artist, note } = baybeatsSet;
  const endTime = addMinutes(startTime, stage === "Concourse" ? 30 : 40);
  const startMinutes = timeToMinutes(startTime);
  const topPosition = (startMinutes - minTime) * pixelsPerMinute;
  const height = (stage === "Concourse" ? 30 : 40) * pixelsPerMinute; // 45 min set

  const inputRef = useRef<HTMLInputElement>(null);
  const [tixCount, setTixCount] = useState<number>(0);
  const [isLongPressed, setIsLongPressed] = useState<boolean>(false);

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
            const success = await storeTicketPdf(file, setMetadata.bandName);
            updateTixCountLSForArtist(
              setMetadata.bandName,
              setMetadata.tixCount,
            );
            if (success) {
              setBandSetCount((c) => (c || 0) + 1);
              setRefreshWorkaround(new Date().getTime());
            }
          } catch (error) {
            console.error("Error processing PDF:", error);
          }
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  useEffect(() => {
    const initFn = async () => {
      const artistSetTixCount = getArtistSetTixCount(artist);
      // make sure pdf and tix count exists locally
      const hasPdfAndTixCount =
        (await getIfPDFExists(artist)) && artistSetTixCount > 0;
      if (hasPdfAndTixCount) {
        setTixCount(getArtistSetTixCount(artist));
      }
    };
    initFn();
  }, [artist, refreshWorkaround]);

  const openTixBlob = async () => {
    const d = await getPDFById(artist);
    const url = URL.createObjectURL(d);
    window.open(url, "_blank");

    // Clean up after a delay (user should have opened it by then)
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const needTix = isNeedTix(stage);
  const attrs = useLongPress(
    () => {
      setIsLongPressed(true);
    },
    {
      onFinish: (e) => {
        e.preventDefault();
        setTimeout(() => {
          setIsLongPressed(false);
        }, 500);
      },
      onCancel: (e) => {
        e.preventDefault();
        setTimeout(() => {
          setIsLongPressed(false);
        }, 5000);
      },
      threshold: 500,
    },
  );

  return (
    <>
      <div
        {...attrs}
        onClick={() => {
          if (tixCount > 0) {
            if (!isLongPressed) {
              openTixBlob();
            }
          } else {
            inputRef.current?.click();
          }
        }}
        className={cx(
          "absolute left-1 right-1 bg-gradient-to-br to-purple-600 rounded-lg px-2 py-1 overflow-hidden hover:scale-105 hover:z-10 transition-transform cursor-pointer shadow-lg flex flex-col min-h-16",
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
            isLongPressed={isLongPressed}
            setRefreshWorkaround={setRefreshWorkaround}
            setBandSetCount={setBandSetCount}
            tixCount={tixCount}
            setTixCount={setTixCount}
            artist={artist}
          />
        )}
      </div>
      <input
        hidden
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileChange}
      />
    </>
  );
};

export { BandSetButton };
