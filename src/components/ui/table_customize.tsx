import {
  Button,
  CircularProgress,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Selection,
  divider,
} from "@heroui/react";
import React from "react";
import { FaChevronDown } from "react-icons/fa";

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

export default function TableCustomize({
  columns,
  data,
  columnsConfig,
  searchBy,
  formModal,
  ariaLabel,
  isLoading = false,
  showVisibleColumns = false,
  enableSelection = false,
  page,
  totalPages,
  onPageChange,
  onSelectionChange: onCustomSelectionChange,
  emptyContent,
}: {
  columns: any[];
  data: any[];
  columnsConfig: any;
  searchBy?: string;
  formModal?: React.ReactNode;
  ariaLabel: string;
  isLoading?: boolean;
  showVisibleColumns?: boolean;
  enableSelection?: boolean;
  page: number;
  totalPages: number;
  emptyContent?: string;
  onPageChange: (page: number) => void;
  onSelectionChange?: (selectedIds: string[], selectedItems: any[]) => void;
}) {
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "",
    direction: "ascending",
  });
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string> | "all">(
    new Set(columns.map((col: any) => col.uid))
  );
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));

  const headerColumns = React.useMemo(() => {
    if (!showVisibleColumns) return columns;
    if (visibleColumns === "all") return columns;
    return columns.filter((column: any) => Array.from(visibleColumns).includes(column.uid));
  }, [columns, visibleColumns, showVisibleColumns]);

  const renderCell = React.useCallback(
    (data: any, columnKey: any) => {
      return columnsConfig[columnKey]
        ? columnsConfig[columnKey](data)
        : data[columnKey] || "-";
    },
    [columnsConfig]
  );

  const sortedItems = React.useMemo(() => {
    return [...(data || [])].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof typeof a];
      const second = b[sortDescriptor.column as keyof typeof b];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, data]);

  const handleSelectionChange = (keys: any) => {
    if (keys === "all") {
      setVisibleColumns("all");
    } else {
      const stringKeys = new Set<string>(Array.from(keys).map((key) => String(key)));
      setVisibleColumns(stringKeys);
    }
  };

  const handleRowSelectionChange = (keys: Selection) => {
    setSelectedKeys(keys);

    let selectedIds: string[] = [];
    let selectedItems: any[] = [];

    if (keys === "all") {
      selectedIds = sortedItems.map((item: any) => String(item.id));
      selectedItems = sortedItems;
    } else {
      selectedIds = Array.from(keys).map((key) => String(key));
      selectedItems = sortedItems.filter((item: any) => selectedIds.includes(String(item.id)));
    }

    if (onCustomSelectionChange) {
      onCustomSelectionChange(selectedIds, selectedItems);
    }
  };

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <div className="flex gap-3">
            {showVisibleColumns && (
              <Dropdown>
                <DropdownTrigger>
                  <Button endContent={<FaChevronDown />} variant="flat">
                    Chọn cột
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Table Columns"
                  closeOnSelect={false}
                  selectedKeys={visibleColumns}
                  selectionMode="multiple"
                  onSelectionChange={handleSelectionChange}
                >
                  {columns.map((column: any) => (
                    <DropdownItem key={column.uid} className="capitalize">
                      {capitalize(column.name)}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            )}
            {formModal}
          </div>
        </div>
      </div>
    );
  }, [formModal, visibleColumns, showVisibleColumns]);

  const bottomContent = React.useMemo(() => {
    const pagination = totalPages && totalPages > 1 ? (
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={totalPages}
        onChange={onPageChange}
      />
    ) : null;

    if (!enableSelection && !pagination) return null;

    return (
      <div className="py-2 px-2 flex flex-col items-center gap-2">
        {pagination && (
          <div className="flex justify-end">
            {pagination}
          </div>
        )}
        {enableSelection && (
          <span className="text-small text-default-400">
            {selectedKeys === "all"
              ? `Tất cả trong trang được chọn`
              : `${selectedKeys.size} / ${sortedItems.length} được chọn`}
          </span>
        )}
      </div>
    );
  }, [page, totalPages, onPageChange, enableSelection, selectedKeys, sortedItems.length]);

  return (
    <Table
      aria-label={ariaLabel}
      isHeaderSticky
      onSortChange={setSortDescriptor}
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      selectionMode={enableSelection ? "multiple" : "none"}
      selectedKeys={enableSelection ? selectedKeys : new Set([])}
      onSelectionChange={enableSelection ? handleRowSelectionChange : undefined}
    >
      <TableHeader columns={headerColumns}>
        {(column: any) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
            className="text-md"
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={sortedItems}
        isLoading={isLoading}
        loadingContent={<CircularProgress aria-label="Loading..." size="md" className="p-10"  />}
        emptyContent={emptyContent || "Không có dữ liệu"}
      >
        {(item: any) => (
          <TableRow key={item.id}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}