import { useEffect, useState, useRef, useCallback } from "react";
import styles from "./dashboard.module.css";
import { InputSwitch } from "primereact/inputswitch";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, ResponsiveContainer, Pie, Cell,
} from "recharts";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
// import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { SupabaseClient } from "../../Helper/Supabase";
import { Dialog } from "primereact/dialog";

type SortField = "Name" | "Email" | "Department" | "Role";
type SortOrder = "asc" | "desc";

   const Dashboard = () => {
   const [isDark, setIsDark] = useState(false);
  const [search, setSearch] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [Page, setPage] = useState(1);
  const [limit, setLimit] = useState(3);
  const [employees, setEmployees] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState<SortField>("Name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [status, setStatus] = useState({ total: 0, leaves: 0, pending: 0 });
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const isFirstRender = useRef(true);
  const skipPageEffect = useRef(false);

   useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
  }, [isDark]);


  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedEmail(searchEmail), 400);
    return () => clearTimeout(t);
  }, [searchEmail]);

  async function fetchStatus() {
    const { data } = await SupabaseClient.from("leave_requests").select("status");
    const { count } = await SupabaseClient.from("profiles").select("*", { count: "exact", head: true });
    if (data) {
      setStatus({
        total: count || 0,
        leaves: data.filter(e => e.status === "approved").length,
        pending: data.filter(e => e.status === "pending").length,
      });
    }
  }

  const fetchEmployees = useCallback(async (page: number, rowLimit: number) => {
    setLoading(true);
    let query = SupabaseClient.from("employee_view").select("*", { count: "exact" });
    if (debouncedSearch) query = query.ilike("full_name", `%${debouncedSearch}%`);
    if (debouncedEmail) query = query.ilike("Email", `%${debouncedEmail}%`);
    if (departmentFilter) query = query.ilike("department", `%${departmentFilter}%`);
    if (roleFilter) query = query.ilike("role", `%${roleFilter}%`);
    if (sortField === "Name") query = query.order("full_name", { ascending: sortOrder === "asc" });
    else if (sortField === "Email") query = query.order("Email", { ascending: sortOrder === "asc" });
    else if (sortField === "Department") query = query.order("department", { ascending: sortOrder === "asc" });
    else if (sortField === "Role") query = query.order("role", { ascending: sortOrder === "asc" });
    const from = (page - 1) * rowLimit;
    query = query.range(from, from + rowLimit - 1);
    const { data, error, count } = await query;
    if (error) { console.error(error); setLoading(false); return; }
    setEmployees((data || []).map((item: any) => ({
      Name: item.full_name,
      Email: item.Email,
      role: item.role,
      department: item.department,
      Preview: item.avatar_url,
    })));
    setTotalCount(count || 0);
    setLoading(false);
  }, [debouncedSearch, debouncedEmail, departmentFilter, roleFilter, sortField, sortOrder]);

  useEffect(() => { fetchStatus(); fetchEmployees(1, limit); }, []);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    skipPageEffect.current = true;
    setPage(1);
    fetchEmployees(1, limit);
  }, [fetchEmployees]);

  useEffect(() => {
    if (isFirstRender.current) return;
    if (skipPageEffect.current) { skipPageEffect.current = false; return; }
    fetchEmployees(Page, limit);
  }, [Page, limit]);

 useEffect(() => {
  const themeId = "primereact-theme-link";
  let link = document.getElementById(themeId) as HTMLLinkElement;

  if (!link) {
    link = document.createElement("link");
    link.id = themeId;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  link.href = isDark
    ? "/node_modules/primereact/resources/themes/lara-dark-blue/theme.css"
    : "/node_modules/primereact/resources/themes/lara-light-blue/theme.css";
}, [isDark]);

  const chartData = [
    { name: "Total", value: status.total },
    { name: "Approved", value: status.leaves },
    { name: "Pending", value: status.pending },
  ];

  
  function handleSort(field: SortField) {
    if (sortField === field) setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("asc"); }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3 }}>⇅</span>;
    return <span>{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  const nameHeader = (
    <>
      <div onClick={() => handleSort("Name")}>Name <SortIcon field="Name" /></div>
      <InputText value={search} onChange={(e) => setSearch(e.target.value)} />
    </>
  );

  const emailHeader = (
    <>
      <div onClick={() => handleSort("Email")}>Email <SortIcon field="Email" /></div>
      <InputText value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} />
    </>
  );

  const deptHeader = (
    <>
      <div onClick={() => handleSort("Department")}>Department <SortIcon field="Department" /></div>
      <InputText value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} placeholder="Search Department" />
    </>
  );

  const roleHeader = (
    <>
      <div onClick={() => handleSort("Role")}>Role <SortIcon field="Role" /></div>
      <InputText value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} placeholder="Search Role" />
    </>
  );

  const imageBody = (rowData: any) => (
    <img
      src={rowData.Preview} alt="profile"
      style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", cursor: "pointer" }}
      referrerPolicy="no-referrer"
      onClick={() => { setSelectedImage(rowData.Preview); setVisible(true); }}
    />
  );

  return (
    <div className={styles.dashboard}>

       <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <InputSwitch
          checked={isDark}
          onChange={(e) => setIsDark(e.value)}
        />
        <span style={{ marginLeft: "8px", color: "var(--text-primary)" }}>
          {isDark ? "🌙 Dark" : "☀️ Light"}
        </span>
      </div>
      <Dialog visible={visible} onHide={() => setVisible(false)} header="Profile Photo">
        <img src={selectedImage} alt="Profile Big"
          style={{ width: "350px", height: "350px", objectFit: "cover", borderRadius: "10px" }}
          referrerPolicy="no-referrer"
        />
      </Dialog>

      <div className={styles.cards}>
        <div>Total Employees: {status.total}</div>
        <div>Approved Leaves: {status.leaves}</div>
        <div>Pending: {status.pending}</div>
      </div>

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
            <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={100} label={({ name, value }) => `${name}: ${value}`} />
            <Pie data={chartData} dataKey="value" outerRadius={100}>
              <Cell fill="#0088FE" />
              <Cell fill="#00C49F" />
              <Cell fill="#FF8042" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <DataTable
        value={employees} loading={loading}
        paginator rows={limit} rowsPerPageOptions={[3, 4, 5]}
        totalRecords={totalCount} lazy
        first={(Page - 1) * limit}
        onPage={(e) => {
          if (e.rows !== limit) { setLimit(e.rows); setPage(1); }
          else { setPage(e.page! + 1); }
        }}
      >
        <Column field="Preview" header="Profile Photo" body={imageBody} />
        <Column field="Name" header={nameHeader} />
        <Column field="Email" header={emailHeader} />
        <Column field="department" header={deptHeader} />
        <Column field="role" header={roleHeader} />
      </DataTable>

    </div>
  );
};

export default Dashboard;