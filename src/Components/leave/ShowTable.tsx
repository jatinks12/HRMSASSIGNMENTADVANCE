import { useCallback, useEffect, useMemo, useState } from "react";
import { SupabaseClient } from "../../Helper/Supabase";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import styles from "./ShowTable.module.css";
import { useAuth } from "../../Context/AuthContext";
import TableSkeleton from "../UI/TableSkeleton";
import type { TableParams } from "./TanstackTable";
import TanstackTable from "./TanstackTable";

type Person = {
  Name: string;
  Email: string;
  start_date: string;
  end_date: string;
  total_days: string;
  reason: string;
  status: string;
  remark: string | null;
};

const ShowTable = () => {
  const { user, permissions } = useAuth();
  const [rows, setRows] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalCount, setTotal] = useState(0);

  const fetchData = useCallback(async (params: TableParams) => {
    setLoading(true);
    try {
      const { page, pageSize, search, sortColumn, sortDirection } = params;
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = SupabaseClient.from("leave_requests")
        .select("*", { count: "exact" })
        .order(sortColumn, { ascending: sortDirection === "asc" })
        .range(from, to);
      if (search) {
        query = query.or(`Name.ilike.%${search}%,Email.ilike.%${search}%`);
      }

      if (!permissions.dashboard && !permissions.management) {
        query = query.eq("user_id", user?.id);
      }
      const { data, count, error } = await query;

      if (error) {
        toast.error(error.message);
      } else {
        setRows(data);
        setTotal(count ?? 0);
      }
    } finally {
      setLoading(false);
    }
  },[user?.id]);

  useEffect(() => {
     fetchData({page:0 , pageSize:6,search:"",sortColumn:"created_at",sortDirection:"desc"});
  }, [user?.id]);

  const columns = useMemo<ColumnDef<Person>[]>(
    () => [
      {
        id: "index",
        header: "S.No",
        cell: ({ row }) => row.index + 1,
      },
      { accessorKey: "Name", header: "Name" },
      { accessorKey: "Email", header: "Email" },
      { accessorKey: "start_date", header: "Start Date" },
      { accessorKey: "end_date", header: "End Date" },
      { accessorKey: "total_days", header: "Days" },
      { accessorKey: "reason", header: "Reason" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span
              className={`${styles.status} ${
                status === "approved"
                  ? styles.approved
                  : status === "rejected"
                    ? styles.rejected
                    : styles.pending
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "remark",
        header: "Remark",
        cell: ({ row }) => {
          const remarks = row.original.remark;
          return (
            <span className={styles.remarks}>{remarks ? remarks : "—"}</span>
          );
        },
      },
    ],
    [],
  );

  // const table = useReactTable({
  //   data: rows,
  //   columns,
  //   getCoreRowModel: getCoreRowModel(),
  // });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>My Leave Requests</h2>
      {/* {loading ? (
        <TableSkeleton rows={5} cols={8}></TableSkeleton>
      ) : (
        <table className={styles.table}>
          <thead className={styles.thead}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className={styles.th}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
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
    </div> */}

    <TanstackTable
        data={rows}
        columns={columns}
        loading={loading}
        onParamsChange={fetchData}
        totalCount={totalCount}
      ></TanstackTable>
    </div>
  );
};

export default ShowTable;
