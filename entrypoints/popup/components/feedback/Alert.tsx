import React from "react";
import { Heading } from "../Heading";
import { Info } from "lucide-react";
import clsx from "clsx";

interface AlertProps {
  title: string;
  subtitle?: string;
  type?: 'error' | 'info';
}

export const Alert = ({ title, subtitle, type = "info" }: AlertProps) => {
  return (
    <div className={
      clsx(
        "rounded-md p-4 border",
        {
          "bg-blue-50 border-blue-400": type === 'info',
          "bg-red-50 border-red-400": type === 'error',
        }
      )
    }>
      <div className="flex items-start gap-2">
        <Info size={20} className="shrink-0" />
        <Heading title={title} subtitle={subtitle} size="md" />
      </div>
    </div>
  );
};
