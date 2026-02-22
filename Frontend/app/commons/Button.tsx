import React from "react";

type BaseProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
};

const baseStyles =
  "px-6 py-2 mx-2 mt-5 rounded-lg text-slate-900 bg-slate-500 transition duration-200 hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

// ---------------- COMMON BUTTON ----------------
export const CommonButton: React.FC<BaseProps> = ({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`${baseStyles}  text-white hover:bg-slate-900 hover:text-white ${className}`}
  >
    {children}
  </button>
);

// ---------------- SAVE BUTTON ----------------
export const SaveButton: React.FC<BaseProps> = ({
  children,
  onClick,
  disabled,
  type = "submit",
  className = "",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`${baseStyles} text-white hover:bg-green-700 ${className}`}
  >
    {children}
  </button>
);

// ---------------- CANCEL BUTTON ----------------
export const CancelButton: React.FC<BaseProps> = ({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`${baseStyles} text-white hover:bg-red-700 ${className}`}
  >
    {children}
  </button>
);
