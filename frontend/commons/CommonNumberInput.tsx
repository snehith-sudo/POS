type CommonNumberInputProps = {
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  readOnly?: boolean;
  max?: number;
  min?: number;
};

export function CommonNumberInput({
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
  readOnly = false,
  max,
  min,
}: CommonNumberInputProps) {
  return (
    <input
      type="number"
      placeholder={placeholder}
      className={`px-3 py-2 border rounded-lg ${className}`}
      max={max}
      min={min}
      value={value || ""}
      required={required}
      onKeyDown={(e) => {
        if (["e", "E", "+", "-"].includes(e.key)) {
          e.preventDefault();
        }
      }}
      readOnly={readOnly}
      onChange={(e) =>
        onChange(e.target.value.replace(/\D+/g, "")) // allow only digits
      }
    />
  );
}
