import { useRef, type ChangeEvent } from "react";
import { timeToMinutes } from "../../utils/clashfinder";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { processPdfData, storeTicketPdf } from "../../utils/pdf";
import cx from "classnames";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

type BandSetButtonProps = {
  slot: {
    time: string;
    artist: string;
    note: string;
  };
  minTime: number;
  pixelsPerMinute: number;
};
const BandSetButton = ({
  slot,
  minTime,
  pixelsPerMinute,
}: BandSetButtonProps) => {
  const { time, artist, note } = slot;
  const startMinutes = timeToMinutes(time);
  const topPosition = (startMinutes - minTime) * pixelsPerMinute;
  const height = 45 * pixelsPerMinute; // 45 min set

  const inputRef = useRef<HTMLInputElement>(null);

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

  const haveTixClass = "from-green-500";
  const noTixClass = "from-pink-500";

  const haveTix = () => {
    const d = localStorage.getItem(`set-${artist}`);
    return !!d;
  };

  return (
    <>
      <div
        onClick={() => {
          inputRef.current?.click();
        }}
        className={cx(
          "absolute left-1 right-1 bg-gradient-to-br to-purple-600 rounded-lg p-2 overflow-hidden hover:scale-105 hover:z-10 transition-transform cursor-pointer shadow-lg",
          haveTix() ? haveTixClass : noTixClass,
        )}
        style={{
          top: `${topPosition}px`,
          height: `${height}px`,
        }}
      >
        <div className="text-white font-bold text-xs mb-1">{time}</div>
        <div className="text-white font-semibold text-sm leading-tight">
          {artist}
        </div>
        {note && (
          <div className="text-white/80 text-xs italic mt-1 leading-tight">
            {note}
          </div>
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
