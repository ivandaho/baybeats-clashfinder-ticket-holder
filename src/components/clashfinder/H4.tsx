import type { PropsWithChildren } from "react";

const H4: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <h4 className="text-white text-xs leading-tight max-w-screen mt-1">
      {children}
    </h4>
  );
};

export { H4 };
