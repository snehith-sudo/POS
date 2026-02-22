import { useState } from "react";
export function LabeledInput({
    label,
    placeholder,
    value,
    onChange,
    className,
}: {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    className?: string;
}) {
    const [focused, setFocused] = useState(false);

    return (
        <div className="labeled-input-container">
            <label className={`labeled-input-label ${focused || value ? "visible" : ""}`}>{label}</label>
            <input
                type="text"
                className={`labeled-input-field ${className || ""}`}
                maxLength={150}
                placeholder={placeholder}
                value={value}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}