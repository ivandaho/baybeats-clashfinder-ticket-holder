import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { deleteTicketPdf, removeArtistTixInfoFromLS } from "../../utils/pdf";
import cx from "classnames";

type TixBadgeProps = {
  tixCount: number;
  artist: string;
  setTixCount: Dispatch<SetStateAction<number>>;
  setBandSetCount: Dispatch<SetStateAction<null | number>>;
  setRefreshWorkaround: Dispatch<SetStateAction<number>>;
  isLongPressed: boolean;
};

const btnClass = "text-white py-[2px] px-[4px] self-end text-[10px] rounded-sm";
const btnDangerClass = "bg-rose-700";
const btnDisabledClass = "bg-gray-400 text-white";

const TixBadge = ({
  tixCount,
  setTixCount,
  artist,
  setBandSetCount,
  setRefreshWorkaround,
  isLongPressed,
}: TixBadgeProps) => {
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const onClickConfirmDelete: React.MouseEventHandler<HTMLSpanElement> = async (
    e,
  ) => {
    e.stopPropagation();
    const success = await deleteTicketPdf(artist);
    if (success) {
      setBandSetCount((c) => (c || 0) - 1);
      removeArtistTixInfoFromLS(artist);
      setTixCount(0);
      setRefreshWorkaround(new Date().getTime());
    }
  };
  return (
    <div
      className={cx(
        "absolute bottom-0 right-0 mb-1 mr-1",
        isLongPressed ? "opacity-0" : "opacity-100",
      )}
    >
      {tixCount > 0 ? (
        showConfirm ? (
          <ConfirmRemove
            setShowConfirm={setShowConfirm}
            onClickConfirmDelete={onClickConfirmDelete}
          />
        ) : (
          <button
            className={cx(btnClass, btnDangerClass)}
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(true);
            }}
          >
            remove {tixCount} tix
          </button>
        )
      ) : (
        <span className={cx(btnClass, "bg-fuchsia-800")}>add tix</span>
      )}
    </div>
  );
};

type ConfirmRemoveProps = {
  onClickConfirmDelete: React.MouseEventHandler<HTMLSpanElement>;
  setShowConfirm: Dispatch<SetStateAction<boolean>>;
};
const ConfirmRemove = ({
  onClickConfirmDelete,
  setShowConfirm,
}: ConfirmRemoveProps) => {
  const [countdownTime, setCountdownTime] = useState<number>(3);

  useEffect(() => {
    setTimeout(() => {
      setCountdownTime(2);
    }, 1000);
    setTimeout(() => {
      setCountdownTime(1);
    }, 2000);
    setTimeout(() => {
      setCountdownTime(0);
    }, 3000);
    setTimeout(() => {
      setCountdownTime(3);
      setShowConfirm(false);
    }, 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      className={cx(
        btnClass,
        countdownTime === 0 ? btnDangerClass : btnDisabledClass,
      )}
      onClick={
        countdownTime === 0
          ? onClickConfirmDelete
          : (e) => {
              e.stopPropagation();
            }
      }
    >
      confirm{countdownTime > 0 && `? (${countdownTime})`}
    </button>
  );
};
export { TixBadge };
