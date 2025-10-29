import type { Dispatch, SetStateAction } from "react";
import { deleteTicketPdf } from "../../utils/pdf";

type TixBadgeProps = {
  hasTix: boolean;
  artist: string;
  setHasTix: Dispatch<SetStateAction<boolean>>;
};

const TixBadge = ({ hasTix, setHasTix, artist }: TixBadgeProps) => {
  return (
    <div className="absolute bottom-0 right-0 mb-1 mr-1">
      {hasTix ? (
        <button
          className="bg-red-700 text-white py-1 px-1 self-end text-[12px]"
          onClick={async (e) => {
            e.stopPropagation();
            const success = await deleteTicketPdf(artist);
            if (success) {
              setHasTix(false);
            }
          }}
        >
          remove tix
        </button>
      ) : (
        <span className="bg-fuchsia-800 text-white py-1 px-1 self-end text-xs rounded-md">
          add tix
        </span>
      )}
    </div>
  );
};
export { TixBadge };
