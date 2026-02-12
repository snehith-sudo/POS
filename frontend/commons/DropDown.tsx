import { useEffect, useRef, useState } from "react";

export function Dropdown<T extends string | number>({
    value,
    onChange,
    options,
}: {
    value: T;
    onChange: (v: T) => void;
    options: { value: T; label: string }[];
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const selectedLabel = options.find((o) => o.value === value)?.label || "";

    return (
        <div className="relative w-48" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm shadow-sm hover:shadow-md focus:outline-none"
            >
                <span className="truncate">{selectedLabel}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-4 h-4 ml-2 transition-transform ${open ? "rotate-180" : ""}`}>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
            </button>

            {open && (
                <ul className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    {options.map((opt) => (
                        <li
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                            className={`px-3 py-2 cursor-pointer text-sm hover:bg-slate-100 ${opt.value === value ? "bg-slate-50 font-medium" : ""}`}
                        >
                            {opt.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

