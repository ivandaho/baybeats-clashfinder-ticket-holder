import type { HTMLProps, PropsWithChildren } from "react";
import cx from "classnames";

const H4: React.FC<PropsWithChildren<HTMLProps<HTMLHeadingElement>>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h4
      className={cx(
        "text-white text-xs leading-tight max-w-screen mt-1",
        className,
      )}
      {...props}
    >
      {children}
    </h4>
  );
};

export { H4 };
