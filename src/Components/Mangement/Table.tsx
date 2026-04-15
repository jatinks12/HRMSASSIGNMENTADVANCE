import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

type Employees = {
  id: string;
  Name: string;
  Email: string;
  role: string;
  department: string;
  phone: string;
};

type Props = {
  employees: Employees[];
  deleteEmployee: (id: string) => void;
  editEmployee: (emp: Employees) => void;
  viewEmployee: (emp: Employees) => void;
  totalRecords: number;
  onPageChange: (page: number, limit: number) => void;
  limit: number;
  currentPage: number;
  loading: boolean;
  onSortChange: (field: string, order: 1 | -1) => void;
  onFilterChange: (filters: any) => void;
};

const EmployeeTable: React.FC<Props> = ({
  employees,
  deleteEmployee,
  editEmployee,
  viewEmployee,
  totalRecords,
  onPageChange,
  limit,
  currentPage,
  loading,
  onSortChange,
  onFilterChange,
}) => {
  const [filtersState, setFiltersState] = useState<any>({
    Name: { value: null, matchMode: "contains" },
    Email: { value: null, matchMode: "contains" },
    department: { value: null, matchMode: "contains" },
    role: { value: null, matchMode: "contains" },
  });

  const [localSortOrder, setLocalSortOrder] = useState<1 | -1>(1);

  const handleManualSort = (field: string) => {
    const newOrder = localSortOrder === 1 ? -1 : 1;
    setLocalSortOrder(newOrder);
    onSortChange(field, newOrder);
  };

  const handlePage = (event: any) => {
    const newPage = event.page + 1;
    const newLimit = event.rows;
    onPageChange(newPage, newLimit);
  };

  const actionBody = (rowData: Employees) => (
    <div style={{ display: "flex", gap: "10px" }}>
      <Button label="View" icon="pi pi-eye" className="p-button-info" onClick={() => viewEmployee(rowData)} />
      <Button label="Edit" icon="pi pi-pencil" className="p-button-warning" onClick={() => editEmployee(rowData)} />
      <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => deleteEmployee(rowData.id)} />
    </div>
  );

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>Employee Table</h2>

      <DataTable
        value={employees}
        paginator
        rows={limit}
        first={(currentPage - 1) * limit}
        totalRecords={totalRecords}
        rowsPerPageOptions={[2, 4, 6]}
        filterDisplay="row"
        filters={filtersState}
        sortMode="single"
        loading={loading}
        lazy
        onPage={handlePage}
        onFilter={(e) => {
          setFiltersState(e.filters);
          onFilterChange(e.filters);
        }}
      >
        <Column
          field="Name"
          header={<span style={{ cursor: "pointer" }} onClick={() => handleManualSort("full_name")}>Name</span>}
          filter
          filterPlaceholder="Search Name"
          showFilterMenu={false}
        />
        <Column
          field="Email"
          header={<span style={{ cursor: "pointer" }} onClick={() => handleManualSort("Email")}>Email</span>}
          filter
          filterPlaceholder="Search Email"
          showFilterMenu={false}
        />
        <Column
          field="department"
          header={<span style={{ cursor: "pointer" }} onClick={() => handleManualSort("department")}>Department</span>}
          filter
          filterPlaceholder="Search Department"
          showFilterMenu={false}
        />
        <Column
          field="role"
          header={<span style={{ cursor: "pointer" }} onClick={() => handleManualSort("role")}>Role</span>}
          filter
          filterPlaceholder="Search Role"
          showFilterMenu={false}
        />
        <Column header="Actions" body={actionBody} />
      </DataTable>

      <h3>Total Employees: {totalRecords}</h3>
    </div>
  );
};

export default EmployeeTable;