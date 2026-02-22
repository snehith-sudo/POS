type Column<T> = {
  header: string;
  render: (row: T, index?: number) => React.ReactNode;
};

type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T, index: number) => string;
};

export function DataTable<T>({
  data,
  columns,
  rowKey,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-lg mt-2">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-6 py-4 text-left text-sm font-semibold"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {data.map((row, index) => (
            <tr
              key={rowKey(row, index)}
              className={`transition duration-200
                ${index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                hover:bg-slate-100`}
            >
              {columns.map((col, i) => (
                <td
                  key={i}
                  className="px-6 py-4 font-medium text-gray-700"
                >
                  {col.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
