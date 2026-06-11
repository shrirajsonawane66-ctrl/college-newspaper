import type { ReactNode } from "react";

export default function WatermarkBackground({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 opacity-[0.025] bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url(/images/myownlogo.png)" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
