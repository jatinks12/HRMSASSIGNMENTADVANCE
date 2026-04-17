import { useEffect, useMemo, useState } from "react";
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
  const {user , permissions} = useAuth()
  const [rows, setRows] = useState<Person[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

  async function fetchData() {
    try{
      setLoading(true);
    if (permissions.dashboard== true || permissions.management == true) {
      const { data, error } = await SupabaseClient
        .from("leave_requests")
        .select(`
          *`);

      if (error) {
        toast.error(error.message);
      } else {
        setRows(data);
      }
    } else {
      const { data, error } = await SupabaseClient
        .from("leave_requests")
        .select(`* `)
        .eq("user_id",user?.id)

      if (error) {
        toast.error(error.message);
      } else {
        setRows(data);
      }
    }
  }
  finally{
    setLoading(false);
  }
  }

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id]);

  const columns = useMemo<ColumnDef<Person>[]>(() => [
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
        const remarks = row.original.remark ;
        return (
          <span className={styles.remarks}>
            {remarks ? remarks : "—"}
          </span>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>My Leave Requests</h2>
       {loading?(
        <TableSkeleton rows={5} cols={8}></TableSkeleton>
      ):(
      <table className={styles.table}>
        <thead className={styles.thead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className={styles.th}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
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
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>)}
    </div>
  );
};

export default ShowTable;