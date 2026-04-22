import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import styles from "./Tanstack.module.css"
import TableSkeleton from "../Components/UI/TableSkeleton";
import { useCallback, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

export type SortDirection = "asc" | "desc";

export type TableParams = {
  page: number;
  pageSize: number;
  search: string;
  sortColumn: string;
  sortDirection: SortDirection;
  filterMode:FilterMode;
  dateRange:DateRange;
};

export type FilterMode="all"|"approved"|"pending"|"rejected"|"past";

export type DateRange={
  from:string;
  to:string;
}

export type FilterConfig={
  key:FilterMode;
  labelId:string
}
export type DatePreset={
  labelId:string;
  getRange:()=>DateRange;
}



const PAGE_SIZE = 6;

function fmt(d:Date){
  return d.toISOString().split("T")[0];
}

export const DEFAULT_DATE_PRESETS:DatePreset[]=[
  {
    labelId:"preset.thisWeek",
    getRange:()=>{
      const now = new Date();
      const day = now.getDay();
      const mon = new Date(now);
      mon.setDate(now.getDate()-((day+6)%7));
      const sun =new Date(mon);
      sun.setDate(mon.getDate()+6);
      return {from:fmt(mon),to:fmt(sun)};
    },
  },
  {
    labelId:"preset.lastWeek",
    getRange:()=>{
      const now = new Date();
      const day = now.getDay();
      const mon = new Date(now);
      mon.setDate(now.getDate()-((day+6)%7)-7);
      const sun = new Date(mon);
      sun.setDate(mon.getDate()+6);
      return {from:fmt(mon),to:fmt(sun)};
    },
  },
  {
    labelId:"preset.thisMonth",
    getRange:()=>{
      const now = new Date();
      const first = new Date(now.getFullYear(),now.getMonth(),1);
      const last = new Date(now.getFullYear(),now.getMonth()+1 ,0);
      return {from:fmt(first),to:fmt(last)};
    },
  },
  {
    labelId:"preset.lastMonth",
    getRange:()=>{
      const now = new Date();
      const first = new Date(now.getFullYear(),now.getMonth()-1,1);
      const last = new Date(now.getFullYear(), now.getMonth(),0);
      return {from:fmt(first),to:fmt(last)};
    },
  },
  {
    labelId:"preset.thisYear",
    getRange:()=>{
      const y = new Date().getFullYear();
      return {from : `${y}-01-01`, to:`${y}-12-31`};
    },
  },

];

export const DEFAULT_FILTERS:FilterConfig[]=[
  {key:"all" , labelId:"filter.all"},
  {key:"approved", labelId:"filter.approved"},
  {key:"pending", labelId:"filter.pending"},
  {key:"rejected",labelId:"filter.rejected"},
  {key:"past", labelId:"filter.past"},
];

type Props<T extends object> = {
  columns: ColumnDef<T>[];
  loading: boolean;
  data: T[];
  totalCount: number;
  onParamsChange: (params: TableParams) => Promise<void>;
  filters?:FilterConfig[];
  datePresets?:DatePreset[];
};

const TanstackTable = <T extends object>({
  columns,
  data,
  loading,
  totalCount,
  onParamsChange,
  filters,
  datePresets,
}: Props<T>) => {

  const intl  = useIntl();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("created_at");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [dateRange,setDateRange] = useState<DateRange>({from:"",to:""});
  const [activePreset,setActivePreset]=useState<string|null>(null);
  const [showPreset , setShowPresets] = useState(false);

  const notify = useCallback(
    (overrides: Partial<TableParams> = {}) => {
      onParamsChange({
        page,
        pageSize: PAGE_SIZE,
        search,
        sortColumn,
        sortDirection: sortDir,
        filterMode,
        dateRange,
        ...overrides,
      });
    },
    [page, search, sortColumn, sortDir,filterMode,dateRange,onParamsChange],
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

  const handleFilter = (mode:FilterMode)=>{
    setFilterMode(mode);
    setPage(0);
    notify({filterMode:mode,page:0})
  }

  const handlePreset = (preset:DatePreset)=>{
    const range = preset.getRange();
    setDateRange(range);
    setActivePreset(preset.labelId);
    setShowPresets(false);
    setPage(0);
    notify({dateRange:range , page:0});
  };

  const handleClearDate =() =>{
    const empty = {from:"",to:""};
    setDateRange(empty);
    setActivePreset(null);
    setPage(0);
    notify({dateRange:empty,page:0});
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasFilters=!!filters;
  const hasPresets=!!datePresets;
  return (
    <div>
      {(hasFilters || hasPresets)&&(
        <div className={styles.filterBar}>
          {hasFilters && filters!.map(({key , labelId})=>(
            <button key={key} className={`${styles.filterBtn} ${filterMode === key ? styles.filterBtnActive:""}`} onClick={()=>handleFilter(key)}>
            <FormattedMessage id={labelId}/>
            </button>
          ))}

          {hasFilters && hasPresets && (
            <span className={styles.filterdivider}/>
          )}

          {hasPresets && (
            <div className={styles.presetWrapper}>
            <button className={`${styles.filterBtn} ${activePreset ? styles.filterBtnDate:""}`} onClick={()=>setShowPresets((v)=>!v)}>
              {activePreset ? intl.formatMessage({id:activePreset}):<FormattedMessage id="filter.setTime"/>}{" "}{showPreset?"▲" : "▼"}
            </button>
            {showPreset && (
              <div className={styles.presetDropdown}>{datePresets!.map((preset)=>(
                <button key={preset.labelId} className={`${styles.presetItem} ${activePreset === preset.labelId? styles.presetItemActive:""}`} onClick={()=>handlePreset(preset)}>
                <FormattedMessage id={preset.labelId}/></button>
              ))}
              {activePreset && (
              <button className={styles.presetClear} onClick={handleClearDate}>
                <FormattedMessage id="filter.clearDate"/>
              </button>
            )}
              </div>
            )}
           </div>
          )} 
          

          { activePreset && dateRange.from && (<span className={styles.dateBadge}>{dateRange.from} →{dateRange.to}</span>)}
        </div>
      )}
      <input
        type="text"
        placeholder={intl.formatMessage({id:"table.searchPlaceholder"})}
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
                      header.column.getCanSort() && handleSort(header.column.id)
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
          <FormattedMessage id="table.prev"/>
        </button>
        <span>
          <FormattedMessage id="table.page"/> {" "} { page + 1}{" "}<FormattedMessage id="table.of"/> {" "}{totalPages}
        </span>
        <button
          onClick={() => handlePage(page + 1)}
          disabled={page >= totalPages - 1}
        >
          <FormattedMessage id="table.next"/>
        </button>
        <div><FormattedMessage id="table.totalCount"/> = {totalCount}</div>
      </div>
    </div>
  );
};

export default TanstackTable;
