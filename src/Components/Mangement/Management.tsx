  import { useEffect, useState } from "react";
  import EmployeeTable from "./Table";
  import { SupabaseClient } from "../../Helper/Supabase";
  import toast from "react-hot-toast";
  import styles from "./Management.module.css";
  import { Link } from "react-router-dom";

  interface Idata {
    id: string;
    Name: string;
    Email: string;
    role: string;
    department: string;
    phone: string;
  }

  const Management = () => {
    const [employees, setEmployee] = useState<Idata[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(4);
    const [totalRecords, setTotalRecords] = useState(0);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<1 | -1 | null>(null);
    const [filters, setFilters] = useState<any>({});
    const [viewEmployee, setViewEmployee] = useState<Idata | null>(null);
    const [editEmployee, setEditEmployee] = useState<Idata | null>(null);
    const [loading, setLoading] = useState(false);

 const fetchData = async (page: number, limit: number) => {
  setLoading(true);

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = SupabaseClient
    .from("employee_view")
    .select("*", { count: "exact" });

  // FILTERS
  if (filters.Name?.value)
    query = query.ilike("full_name", `%${filters.Name.value}%`);
  if (filters.Email?.value)
    query = query.ilike("Email", `%${filters.Email.value}%`);
  if (filters.role?.value)
    query = query.ilike("role", `%${filters.role.value}%`);
  if (filters.department?.value)
    query = query.ilike("department", `%${filters.department.value}%`);

  // SORTING
  if (sortField && sortOrder !== null) {
    const fieldMap: Record<string, string> = {
      Name:       "full_name",
      Email:      "Email",
      phone:      "phone",
      role:       "role",
      department: "department",
    };
    query = query.order(fieldMap[sortField] ?? sortField, {
      ascending: sortOrder === 1,
      nullsFirst: false,
    });
  }

  const { data, error, count } = await query.range(from, to);
  setLoading(false);

  if (error) { toast.error(error.message); return; }

  const flat: Idata[] = data.map((emp: any) => ({
    id:         emp.id,
    Name:       emp.full_name,
    Email:      emp.Email,
    phone:      emp.phone,
    role:       emp.role || "—",
    department: emp.department || "—",
  }));

  setEmployee(flat);
  setTotalRecords(count || 0);
};

    useEffect(() => {
      fetchData(page, limit);
    }, [page, limit, sortField, sortOrder, filters]);

    
    useEffect(() => {
      setPage(1);
    }, [filters, sortField, sortOrder]);

    const deleteEmployee = async (id: string) => {
      const { error } = await SupabaseClient
        .from("profiles")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Employee Deleted");
      fetchData(page, limit);
    };

    const handleEditSave = async (updated: Idata) => {
      const { error } = await SupabaseClient
        .from("profiles")
        .update({
          full_name: updated.Name,
          phone: updated.phone,
        })
        .eq("id", updated.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Employee Updated");
      setEditEmployee(null);
      fetchData(page, limit);
    };

    return (
      <div className={styles.tableWrapper}>
        <button ><Link to="/signup">AddEmployee</Link></button>
        <h1 className={styles.title}>Employees Management</h1>

        <EmployeeTable
          employees={employees}
          deleteEmployee={deleteEmployee}
          editEmployee={setEditEmployee}
          viewEmployee={setViewEmployee}
          totalRecords={totalRecords}
          limit={limit}
          currentPage={page}
          loading={loading}
          onPageChange={(p, l) => {
            if (l !== limit) setPage(1);
            else setPage(p);
            setLimit(l);
          }}
          onSortChange={(field, order) => {
            setSortField(field);
            setSortOrder(order);
          }}
          onFilterChange={(f) => setFilters(f)}
        />
            
        {viewEmployee && (
          <div className={styles.view}>
            <div className={styles.viewModal}>
              <h2>Employee Details</h2>
              <p><b>Name:</b> {viewEmployee.Name}</p>
              <p><b>Email:</b> {viewEmployee.Email}</p>
              <p><b>Phone:</b> {viewEmployee.phone}</p>
              <p><b>Department:</b> {viewEmployee.department}</p>
              <p><b>Role:</b> {viewEmployee.role}</p>
              <button className={styles.button} onClick={() => setViewEmployee(null)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editEmployee && (
          <div className={styles.view}>
            <div className={styles.viewModal}>
              <h2>Edit Employee</h2>

              <input
                className={styles.input}
                value={editEmployee.Name}
                onChange={(e) =>
                  setEditEmployee({ ...editEmployee, Name: e.target.value })
                }
              />

              <input
                className={styles.input}
                value={editEmployee.phone}
                onChange={(e) =>
                  setEditEmployee({ ...editEmployee, phone: e.target.value })
                }
              />

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  className={styles.button}
                  onClick={() => handleEditSave(editEmployee)}
                >
                  Save
                </button>
                <button
                  className={styles.button}
                  onClick={() => setEditEmployee(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default Management;