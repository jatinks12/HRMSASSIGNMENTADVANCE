import { useEffect, useState, useRef, useCallback } from "react";
import styles from "./dashboard.module.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, ResponsiveContainer, Pie, Cell,
} from "recharts";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { SupabaseClient } from "../../Helper/Supabase";

type SortField = "Name" | "Email";
type SortOrder = "asc" | "desc";

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");

  const [Page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const [employees, setEmployees] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [departmentFilter, setDepartmentFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [sortField, setSortField] = useState<SortField>("Name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [status, setStatus] = useState({ total: 0, leaves: 0, pending: 0 });
  const [loading, setLoading] = useState(false);

  const isFirstRender = useRef(true);
  const skipPageEffect = useRef(false);

  // 🔹 Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedEmail(searchEmail), 400);
    return () => clearTimeout(t);
  }, [searchEmail]);

  // 🔹 Fetch Stats
  async function fetchStatus() {
    const { data } = await SupabaseClient
      .from("leave_requests")
      .select("status");

   const { count: employeeCount } = await SupabaseClient
    .from("profiles")
    .select("*", { count: "exact", head: true });

    if (data) {
      setStatus({
        total: employeeCount||0,
        leaves: data.filter(e => e.status === "approved").length,
        pending: data.filter(e => e.status === "Pending").length,
      });
    }
  }

  // 🔹 Fetch Employees
  const fetchEmployees = useCallback(async (page: number, rowLimit: number) => {
    setLoading(true);

    let query = SupabaseClient
      .from("profiles")
      .select(`
        id,
        full_name,
        Email,
        roles(emprole),
        departments!profiles_department_id_fkey(empDepartment)
      `, { count: "exact" });

    // Search
    if (debouncedSearch) {
      query = query.ilike("full_name", `%${debouncedSearch}%`);
    }

    if (debouncedEmail) {
      query = query.ilike("Email", `%${debouncedEmail}%`);
    }

    // Sorting
    if (sortField === "Name") {
      query = query.order("full_name", { ascending: sortOrder === "asc" });
    } else if (sortField === "Email") {
      query = query.order("Email", { ascending: sortOrder === "asc" });
    }

    // Pagination
    const from = (page - 1) * rowLimit;
    query = query.range(from, from + rowLimit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    let formatted = (data || []).map((item: any) => ({
      Name: item.full_name,
      Email: item.Email,
      role: item.roles?.emprole || "",
      department: item.departments?.empDepartment || "",
    }));

    // ⚠️ Frontend filtering (due to Supabase join limits)
    if (departmentFilter) {
      formatted = formatted.filter(e => e.department === departmentFilter);
    }

    if (roleFilter) {
      formatted = formatted.filter(e => e.role === roleFilter);
    }

    setEmployees(formatted);
    setTotalCount(count || 0);
    setLoading(false);
  }, [debouncedSearch, debouncedEmail, sortField, sortOrder, departmentFilter, roleFilter]);

  // 🔹 Initial load
  useEffect(() => {
    fetchStatus();
    fetchEmployees(1, limit);
  }, []);

  // 🔹 Filter/sort change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    skipPageEffect.current = true;
    setPage(1);
    fetchEmployees(1, limit);
  }, [fetchEmployees]);

  // 🔹 Page change
  useEffect(() => {
    if (isFirstRender.current) return;
    if (skipPageEffect.current) {
      skipPageEffect.current = false;
      return;
    }
    fetchEmployees(Page, limit);
  }, [Page]);

  // 🔹 Chart Data
  const chartData = [
    { name: "Total", value: status.total },
    { name: "Approved", value: status.leaves },
    { name: "Pending", value: status.pending },
  ];

  // 🔹 Sorting
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3 }}>⇅</span>;
    return <span>{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  // 🔹 Headers
  const nameHeader = (
    <>
      <div onClick={() => handleSort("Name")}>
        Name <SortIcon field="Name" />
      </div>
      <InputText value={search} onChange={(e) => setSearch(e.target.value)} />
    </>
  );

  const emailHeader = (
    <>
      <div onClick={() => handleSort("Email")}>
        Email <SortIcon field="Email" />
      </div>
      <InputText value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} />
    </>
  );

  const deptHeader = (
    <>
      <div>Department</div>
      <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
        <option value="">All</option>
        <option value="techOps">techOps</option>
        <option value="HR">HR</option>
      </select>
    </>
  );

  const roleHeader = (
    <>
      <div>Role</div>
      <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
        <option value="">All</option>
        <option value="Software Developer">Software Developer</option>
        <option value="Full Stack">Full Stack</option>
      </select>
    </>
  );

  return (
    <div className={styles.dashboard}>

      {/* Cards */}
      <div className={styles.cards}>
        <div>Total Employees: {status.total}</div>
        <div>Approved Leaves: {status.leaves}</div>
        <div>Pending: {status.pending}</div>
      </div>

      {/* Charts */}
      <div className={styles.charts}>
        <ResponsiveContainer width="50%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="blue" />
          </BarChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="50%" height={300}>
          <PieChart>
            <Pie data={chartData} dataKey="value" outerRadius={100}>
              <Cell fill="#0088FE" />
              <Cell fill="#00C49F" />
              <Cell fill="#FF8042" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <DataTable
        value={employees}
        loading={loading}
        paginator
        lazy
        rows={limit}
        totalRecords={totalCount}
        first={(Page - 1) * limit}
        onPage={(e) => {
          setPage(e.page! + 1);
          setLimit(e.rows);
        }}
      >
        <Column field="Name" header={nameHeader} />
        <Column field="Email" header={emailHeader} />
        <Column field="department" header={deptHeader} />
        <Column field="role" header={roleHeader} />
      </DataTable>
    </div>
  );
};

export default Dashboard;