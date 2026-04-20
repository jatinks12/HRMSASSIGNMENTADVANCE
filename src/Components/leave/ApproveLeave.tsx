import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { SupabaseClient } from "../../Helper/Supabase";
import { type ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";
import styles from "./ApproveLeave.module.css";
import { useAuth } from "../../Context/AuthContext";
import Spinner from "../UI/Spinner";
import TanstackTable, {
  type TableParams,
} from "../../SharedComponents/TanstackTable";

type Person = {
  id: number;
  avatar_url: string;
  Name: string;
  Email: string;
  start_date: string;
  end_date: string;
  total_days: string;
  reason: string;
  status: string;
};

const ApproveLeave = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [totalCount, setTotal] = useState(0);
  const remarksRef = useRef<{ [key: number]: string }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchData = useCallback(async (params: TableParams) => {
    setLoading(true);
    try {
      const { page, pageSize, search, sortColumn, sortDirection } = params;
      const from = page * pageSize;
      const to = from + pageSize - 1;
      let query = SupabaseClient.from("employee_leave_view")
        .select("*", { count: "exact" })
        .order(sortColumn, { ascending: sortDirection === "asc" })
        .range(from, to);
      if (search) {
        query = query.or(`Name.ilike.%${search}%,Email.ilike.%${search}%`);
      }

      const { data, count, error } = await query;

      if (error) {
        toast.error(error.message);
      } else {
        setRows(data ?? []);
        setTotal(count ?? 0);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData({
      page: 0,
      pageSize: 6,
      search: "",
      sortColumn: "created_at",
      sortDirection: "desc",
    });
  }, []);

  async function handleDecision(
    leave: Person,
    decision: "approved" | "rejected",
  ) {
    setActionLoading(leave.id);
    try {
      const remark = remarksRef.current[leave.id] || "";
      const { error } = await SupabaseClient.from("leave_approvals").upsert(
        {
          leave_request_id: leave.id,
          approved_by: user?.email,
          decision,
          remarks: remark,
        },
        { onConflict: "leave_request_id" },
      );        
      if (error) {
        toast.error(
          `${decision === "approved" ? "Approved" : "Rejected"} failed`,
        );
        return;
      }

      const { error: err } = await SupabaseClient.from("leave_requests")
        .update({ status: decision, remark: remark })
        .eq("id", leave.id);
      if (err) {
        console.log(err);
      }
      toast.success(decision === "approved" ? "Approved" : "Rejected");
      remarksRef.current[leave.id] = "";
    } finally {
      setActionLoading(null);
    }
  }
  console.log(rows);
  const columns = useMemo<ColumnDef<Person>[]>(
    () => [
      {
        id: "index",
        header: "S.No",
        cell: ({ row }) => row.index + 1,
      },
      {
        id: "avatar",
        header: "Avatar",
        cell: ({ row }) => (
          <img
            src={row.original.avatar_url}
            onClick={() => setSelectedImage(row.original.avatar_url)}
            style={{ width: "30px", height: "30px", borderRadius: "50%",  objectFit: "cover"}}
          ></img>
        ),
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
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const leave = row.original;
          return (
            <div className={styles.actions}>
              <input
                type="text"
                placeholder="Remarks..."
                className={styles.input}
                defaultValue={remarksRef.current[leave.id] || ""}
                onChange={(e) => {
                  remarksRef.current[leave.id] = e.target.value;
                }}
              />
              <div className={styles.buttonGroup}>
                <button
                  className={styles.approveBtn}
                  onClick={() => handleDecision(leave, "approved")}
                  disabled={
                    leave.status === "approved" || actionLoading === leave.id
                  }
                >
                  {actionLoading === leave.id ? "Processing..." : "Approve"}
                </button>
                <button
                  className={styles.rejectBtn}
                  onClick={() => handleDecision(leave, "rejected")}
                  disabled={
                    leave.status === "rejected" || actionLoading === leave.id
                  }
                >
                  {actionLoading === leave.id ? (
                    <>
                      <Spinner size="sm" color="danger" />
                      Processing...
                    </>
                  ) : (
                    "Reject"
                  )}
                </button>
              </div>
            </div>
          );
        },
      },
    ],
    [actionLoading],
  );

  // const table = useReactTable({
  //   data: rows,
  //   columns,
  //   getCoreRowModel: getCoreRowModel(),
  // });

  return (
    // <div className={styles.container}>
    //   <h2 className={styles.title}>Leave Approval Dashboard</h2>
    //   {loading ? (
    //     <TableSkeleton rows={5} cols={8}></TableSkeleton>
    //   ) : (
    //     <table className={styles.table}>
    //       <thead className={styles.thead}>
    //         {table.getHeaderGroups().map((headerGroup) => (
    //           <tr key={headerGroup.id}>
    //             {headerGroup.headers.map((header) => (
    //               <th key={header.id} className={styles.th}>
    //                 {flexRender(
    //                   header.column.columnDef.header,
    //                   header.getContext(),
    //                 )}
    //               </th>
    //             ))}
    //           </tr>
    //         ))}
    //       </thead>
    //       <tbody>
    //         {table.getRowModel().rows.map((row) => (
    //           <tr key={row.id} className={styles.tr}>
    //             {row.getVisibleCells().map((cell) => (
    //               <td key={cell.id} className={styles.td}>
    //                 {flexRender(cell.column.columnDef.cell, cell.getContext())}
    //               </td>
    //             ))}
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   )}
    // </div>
    <div className={styles.container}>
      <h2 className={styles.title}>Leave Approval Dashboard</h2>
      <TanstackTable
        data={rows}
        columns={columns}
        loading={loading}
        onParamsChange={fetchData}
        totalCount={totalCount}
      ></TanstackTable>
      {selectedImage && (
  <div
    className={styles.modalOverlay}
    onClick={() => setSelectedImage(null)}
  >
    <div
      className={styles.modalContent}
      onClick={(e) => e.stopPropagation()}
    >
      <img src={selectedImage} className={styles.modalImage} />
    </div>
  </div>
)}
    </div>
  );
};

export default ApproveLeave;
