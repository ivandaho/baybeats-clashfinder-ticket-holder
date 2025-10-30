import type { HTMLProps, PropsWithChildren } from "react";

const H4: React.FC<PropsWithChildren<HTMLProps<HTMLHeadingElement>>> = ({
  children,
  ...props
}) => {
  return (
    <h4
      {...props}
      className="text-white text-xs leading-tight max-w-screen mt-1"
    >
      {children}
    </h4>
  );
};

export { H4 };
