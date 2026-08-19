import type { BaybeatsStage } from "../../types/types";
import cx from "../../utils/cx";

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
          <th key={stage} className={cx(mainClasses)}>
            <div
              className={cx(
                "bg-fuchsia-950 text-white font-bold text-center p-2 border-b-2 border-white/30 text-nowrap truncate",
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
