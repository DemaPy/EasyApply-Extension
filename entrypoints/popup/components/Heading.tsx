import clsx from "clsx";
import React from "react";

interface HeadingProps {
  title: string;
  subtitle?: string;
  size?: "sm" | "md" | "xl";
}

export const Heading = ({ title, subtitle, size = "md" }: HeadingProps) => {
  return (
    <header>
      <h2
        className={clsx("font-bold text-slate-800", {
          "text-2xl": size === "xl",
          "text-sm": size === "md",
          "text-xs": size === "sm",
        })}
      >
        {title}
      </h2>
      {subtitle && <p className="text-xs text-slate-600">{subtitle}</p>}
    </header>
  );
};
