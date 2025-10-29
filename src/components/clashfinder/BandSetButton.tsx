import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { isNeedTix, timeToMinutes } from "../../utils/clashfinder";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import {
  deleteTicketPdf,
  getIfPDFExists,
  getPDFById,
  processPdfData,
  storeTicketPdf,
} from "../../utils/pdf";
import cx from "classnames";
import type { BaybeatsStage } from "../../types/types";
import { TixBadge } from "./TixBadge";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const haveTixClass = "from-green-500";
const noTixClass = "from-pink-500";
const dontNeedTixClass = "from-blue-400";

type BandSetButtonProps = {
  slot: {
    time: string;
    artist: string;
    note: string;
  };
  stage: BaybeatsStage;
  minTime: number;
  pixelsPerMinute: number;
};

const BandSetButton = ({
  slot,
  minTime,
  stage,
  pixelsPerMinute,
}: BandSetButtonProps) => {
  const { time, artist, note } = slot;
  const startMinutes = timeToMinutes(time);
  const topPosition = (startMinutes - minTime) * pixelsPerMinute;
  const height = 45 * pixelsPerMinute; // 45 min set

  const inputRef = useRef<HTMLInputElement>(null);
  const [hasTix, setHasTix] = useState<boolean>(false);

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
            if (success) {
							// TODO
              console.log("success");
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
      setHasTix(await getIfPDFExists(artist));
    };
    initFn();
  }, [artist]);

  const openTixBlob = async () => {
    const d = await getPDFById(artist);
    const url = URL.createObjectURL(d);
    window.open(url, "_blank");

    // Clean up after a delay (user should have opened it by then)
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const needTix = isNeedTix(stage);

  return (
    <>
      <div
        onClick={() => {
          if (hasTix) {
            openTixBlob();
          } else {
            inputRef.current?.click();
          }
        }}
        className={cx(
          "absolute left-1 right-1 bg-gradient-to-br to-purple-600 rounded-lg p-2 overflow-hidden hover:scale-105 hover:z-10 transition-transform cursor-pointer shadow-lg flex flex-col",
          needTix ? (hasTix ? haveTixClass : noTixClass) : dontNeedTixClass,
        )}
        style={{
          top: `${topPosition}px`,
          height: `${height}px`,
        }}
      >
        <div className="text-white font-bold text-xs mb-1">{time}</div>
        <div className="text-white font-semibold text-sm leading-tight grow">
          {artist}
        </div>
        {note && (
          <div className="text-white/80 text-xs italic mt-1 leading-tight">
            {note}
          </div>
        )}
        {needTix && (
          <TixBadge hasTix={hasTix} artist={artist} setHasTix={setHasTix} />
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
