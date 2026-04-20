import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import styles from "./Tanstack.module.css"
import TableSkeleton from "../Components/UI/TableSkeleton";
import { useCallback, useState } from "react";

export type SortDirection = "asc" | "desc";

export type TableParams = {
  page: number;
  pageSize: number;
  search: string;
  sortColumn: string;
  sortDirection: SortDirection;
};

type Props<T extends object> = {
  columns: ColumnDef<T>[];

  loading: boolean;
  data: T[];
  totalCount: number;
  onParamsChange: (params: TableParams) => Promise<void>;
};

const PAGE_SIZE = 6;

const TanstackTable = <T extends object>({
  columns,
  data,
  loading,
  totalCount,
  onParamsChange,
}: Props<T>) => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("created_at");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const notify = useCallback(
    (overrides: Partial<TableParams> = {}) => {
      onParamsChange({
        page,
        pageSize: PAGE_SIZE,
        search,
        sortColumn,
        sortDirection: sortDir,
        ...overrides,
      });
    },
    [page, search, sortColumn, sortDir],
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
    notify({ search: e.target.value, page: 0 });
  };

  const handleSort = (col: string) => {
    const newDir = sortColumn === col && sortDir === "asc" ? "desc" : "asc";
    setSortColumn(col);
    setSortDir(newDir);
    notify({ sortColumn: col, sortDirection: newDir });
  };
  const handlePage = (newPage: number) => {
    setPage(newPage);
    notify({ page: newPage });
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  return (
    <div>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={handleSearch}
        className={styles.searchInput}
      />
      {loading ? (
        <TableSkeleton rows={5} cols={8}></TableSkeleton>
      ) : (
        <table className={styles.table}>
          <thead className={styles.thead}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={styles.th}
                    onClick={() =>
                      header.column.getCanSort() && handleSort(header.id)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {sortColumn === header.id
                      ? sortDir === "asc"
                        ? " ↑"
                        : " ↓"
                      : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={styles.tr}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.pagination}>
        <button onClick={() => handlePage(page - 1)} disabled={page === 0}>
          Prev
        </button>
        <span>
          Page{page + 1}of{totalPages}
        </span>
        <button
          onClick={() => handlePage(page + 1)}
          disabled={page >= totalPages - 1}
        >
          Next
        </button>
        <div>Totol Count = {totalCount}</div>
      </div>
    </div>
  );
};

export default TanstackTable;
