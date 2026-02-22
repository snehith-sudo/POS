type EndDateProps = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
};

const today = new Date().toISOString().split("T")[0];

export function EndDate({ value, onChange, min }: EndDateProps) {
  return (
    <input
      type="date"
      value={value}
      min={min}
      max={today}
      onChange={(e) => onChange(e.target.value)}
      className="
        px-3 py-2 border border-gray-300 rounded-md text-sm
        focus:ring-2 focus:ring-slate-500
      "
    />
  );
}
