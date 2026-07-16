"use client";

import { Check, X } from "lucide-react";

interface NegativeMarkingSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function NegativeMarkingSwitch({
  value,
  onChange,
}: NegativeMarkingSwitchProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Negative Marking
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Enable or disable negative marking for wrong answers.
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`
          flex w-full items-center justify-between
          rounded-2xl border p-5 transition-all duration-300
          ${
            value
              ? "border-red-200 bg-red-50"
              : "border-slate-200 bg-white hover:border-blue-300"
          }
        `}
      >
        <div>
          <p className="font-semibold text-slate-900">
            {value ? "Enabled" : "Disabled"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {value
              ? "Wrong answers will reduce your score."
              : "Wrong answers won't reduce your score."}
          </p>
        </div>

        <div
          className={`
            flex h-12 w-12 items-center justify-center rounded-full
            ${
              value
                ? "bg-red-500 text-white"
                : "bg-slate-100 text-slate-600"
            }
          `}
        >
          {value ? <X size={22} /> : <Check size={22} />}
        </div>
      </button>
    </div>
  );
}