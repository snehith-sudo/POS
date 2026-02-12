type StartDateProps = {
  value: string;
  onChange: (value: string) => void;
};
const today = new Date().toISOString().split("T")[0];

export function StartDate({ value, onChange }: StartDateProps) {
  return (
    <input
      type="date"
      value={value}
      max={today}
      onChange={(e) => onChange(e.target.value)}
      className="
        px-3 py-2 border border-gray-300 rounded-md text-sm
        focus:ring-2 focus:ring-slate-500
      "
    />
  );
}
