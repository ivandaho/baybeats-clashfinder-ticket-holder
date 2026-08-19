import type { BaybeatsStage } from "../../types/types";
import { needTixBorderClassName } from "../../utils/clashfinder";
import cx from "../../utils/cx";

const needTixStages: BaybeatsStage[] = ["Annexe", "Powerhouse"];

type HeadeStuffProps = {
  stages: BaybeatsStage[];
};
const TableHeader = (props: HeadeStuffProps) => {
  const { stages } = props;
  const mainClasses = "sticky z-99999 w-screen top-0";
  return (
    <thead>
      <tr>
        {stages.map((stage) => (
          <th
            key={stage}
            className={cx(
              mainClasses,
              needTixStages.includes(stage) ? needTixBorderClassName : "",
            )}
          >
            <div
              className={cx(
                "bg-fuchsia-950 font-bold text-center p-2 border-b-2 border-white/30 text-nowrap truncate",
                needTixStages.includes(stage)
                  ? "text-lime-500 text-shadow-md"
                  : "text-white",
              )}
            >
              {stage}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export { TableHeader };
