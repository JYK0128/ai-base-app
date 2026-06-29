import { flexRender, type Header } from '@tanstack/react-table';
import { ArrowLeftToLine,
         ArrowRightToLine,
         Calendar,
         ChevronDown,
         ChevronUp,
         Filter,
         MoreVertical,
         PinOff,
         RotateCcw,
         Search } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { DropdownMenu,
         DropdownMenuCheckboxItem,
         DropdownMenuContent,
         DropdownMenuItem,
         DropdownMenuSeparator,
         DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ColumnMeta {
  faceted?: {
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
    facetCounts?: Record<string, number>
  }
  filterType?: 'number' | 'date' | 'text'
}

interface DataTableColumnHeaderProps<TData, TValue> {
  header: Header<TData, TValue>
  enableColumnPinning?: boolean
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number | undefined) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (value === initialValue) return;
      onChange(value === '' ? undefined : value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, onChange, debounce, initialValue]);

  return (
    <Input
      {...props}
      value={value ?? ''}
      onChange={(e) => {
        let val: string | number = e.target.value;
        if (e.target.type === 'number' && e.target.value !== '') {
          val = Number(e.target.value);
        }
        setValue(val);
      }}
    />
  );
}

export function DataTableColumnHeader<TData, TValue>({
  header,
  enableColumnPinning = true,
}: Readonly<DataTableColumnHeaderProps<TData, TValue>>) {
  const isAction = header.column.id === 'select';
  const column = header.column;

  const meta = column.columnDef.meta as ColumnMeta;
  const facetedConfig = meta?.faceted;
  const filterType = meta?.filterType;
  const sortDirection = header.column.getIsSorted();
  const canSort = header.column.getCanSort();
  const canPin = enableColumnPinning
    && header.column.getCanPin()
    && header.column.id !== 'pin'
    && header.column.id !== 'select';

  const filterValue = column.getFilterValue();
  const selectedValues = facetedConfig ? new Set(filterValue as string[]) : new Set();
  const facetValues = facetedConfig ? column.getFacetedUniqueValues() : undefined;

  if (header.isPlaceholder) {
    return null;
  }

  if (isAction) {
    return (
      <div className="flex size-full items-center justify-center">
        {flexRender(header.column.columnDef.header, header.getContext())}
      </div>
    );
  }

  let isFiltered = false;
  if (filterValue !== undefined) {
    if (Array.isArray(filterValue)) {
      isFiltered = filterValue.some((v) => v !== undefined && v !== '');
    }
    else {
      isFiltered = filterValue !== '';
    }
  }
  const canFilter = Boolean(facetedConfig || filterType || isFiltered);
  const canOpenColumnMenu = canSort || canFilter || canPin;

  return (
    <div className="flex size-full items-center gap-1 overflow-hidden px-2.5">
      <div
        className={cn(
          `group/title flex h-full min-w-0 flex-1 items-center gap-1.5`,
          canSort && 'cursor-pointer',
        )}
        onClick={() => {
          if (canSort) {
            header.column.toggleSorting(undefined, true);
          }
        }}
      >
        <div className="
          truncate text-[11px] font-bold tracking-wide whitespace-nowrap
          text-muted-foreground uppercase transition-colors
          group-hover/title:text-foreground
        "
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
        </div>

        {canSort && sortDirection && (
          <div className="shrink-0">
            {sortDirection === 'asc'
              ? (
                <ChevronUp className="size-3.5 text-primary" />
              )
              : (
                <ChevronDown className="size-3.5 text-primary" />
              )}
          </div>
        )}

        {isFiltered && (
          <div className="
            size-1.5 shrink-0 animate-pulse rounded-full bg-primary
          "
          />
        )}
      </div>

      {canOpenColumnMenu && (
        <div
          className={cn(
            'flex shrink-0 items-center gap-0.5',
            (!header.column.getIsPinned() && !isFiltered) && `
              invisible
              group-hover/head:visible
            `,
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  `
                    size-6 rounded-sm p-0 text-muted-foreground/60
                    hover:bg-accent hover:text-foreground
                  `,
                  (header.column.getIsPinned() || isFiltered) && `
                    visible bg-primary/5 text-primary
                  `,
                )}
              >
                <MoreVertical className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-1">
              {canSort && (
                <>
                  <div className="
                    px-2 py-1.5 text-[10px] leading-none font-bold
                    tracking-widest text-muted-foreground/60 uppercase
                  "
                  >
                    Sorting
                  </div>

                  <DropdownMenuCheckboxItem
                    checked={header.column.getIsSorted() === 'asc'}
                    onCheckedChange={() => header.column.toggleSorting(false)}
                  >
                    <ChevronUp className="mr-2 size-4 text-muted-foreground/70" />
                    Sort Ascending
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={header.column.getIsSorted() === 'desc'}
                    onCheckedChange={() => header.column.toggleSorting(true, true)}
                  >
                    <ChevronDown className="
                      mr-2 size-4 text-muted-foreground/70
                    "
                    />
                    Sort Descending
                  </DropdownMenuCheckboxItem>

                  {header.column.getIsSorted() && (
                    <DropdownMenuItem
                      onClick={() => header.column.clearSorting()}
                      className="
                        text-destructive
                        focus:text-destructive
                      "
                    >
                      <RotateCcw className="mr-2 size-4" />
                      Clear Sorting
                    </DropdownMenuItem>
                  )}
                </>
              )}

              {/* Faceted Filter Section */}
              {facetedConfig && (
                <>
                  <DropdownMenuSeparator />
                  <div className="
                    flex items-center gap-1.5 px-2 py-1.5 text-[10px]
                    leading-none font-bold tracking-widest
                    text-muted-foreground/60 uppercase
                  "
                  >
                    <Filter className="size-3" />
                    Filter:
                    {' '}
                    {header.column.columnDef.header as string}
                  </div>
                  <div className="scroll-y max-h-50">
                    {facetedConfig.options.map((option) => {
                      const isSelected = selectedValues.has(option.value);
                      const count = facetedConfig.facetCounts
                        ? facetedConfig.facetCounts[option.value]
                        : facetValues?.get(option.value);

                      return (
                        <DropdownMenuCheckboxItem
                          key={option.value}
                          checked={isSelected}
                          onCheckedChange={() => {
                            if (isSelected) {
                              selectedValues.delete(option.value);
                            }
                            else {
                              selectedValues.add(option.value);
                            }
                            const filterValues = Array.from(selectedValues);
                            column.setFilterValue(
                              filterValues.length ? filterValues : undefined,
                            );
                          }}
                        >
                          {option.icon && (
                            <option.icon className="
                              mr-2 size-4 text-muted-foreground/70
                            "
                            />
                          )}
                          <span className="flex-1 text-xs">{option.label}</span>
                          {count !== undefined && (
                            <span className="
                              ml-2 font-mono text-[10px]
                              text-muted-foreground/50
                            "
                            >
                              {count}
                            </span>
                          )}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Number Range Filter Section */}
              {filterType === 'number' && (
                <>
                  <DropdownMenuSeparator />
                  <div className="
                    flex items-center gap-1.5 px-2 py-1.5 text-[10px]
                    leading-none font-bold tracking-widest
                    text-muted-foreground/60 uppercase
                  "
                  >
                    <Filter className="size-3" />
                    Range:
                    {' '}
                    {header.column.columnDef.header as string}
                  </div>
                  <div className="flex items-center gap-2 p-2" onClick={(e) => e.stopPropagation()}>
                    <DebouncedInput
                      placeholder="Min"
                      type="number"
                      value={(filterValue as [number, number])?.[0] ?? ''}
                      onChange={(val) => {
                        column.setFilterValue((old: [number, number]) => [val as number, old?.[1]]);
                      }}
                      className="h-8 bg-muted/30 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">-</span>
                    <DebouncedInput
                      placeholder="Max"
                      type="number"
                      value={(filterValue as [number, number])?.[1] ?? ''}
                      onChange={(val) => {
                        column.setFilterValue((old: [number, number]) => [old?.[0], val as number]);
                      }}
                      className="h-8 bg-muted/30 text-xs"
                    />
                  </div>
                </>
              )}

              {/* Date Range Filter Section */}
              {filterType === 'date' && (
                <>
                  <DropdownMenuSeparator />
                  <div className="
                    flex items-center gap-1.5 px-2 py-1.5 text-[10px]
                    leading-none font-bold tracking-widest
                    text-muted-foreground/60 uppercase
                  "
                  >
                    <Calendar className="size-3" />
                    Date Range:
                    {' '}
                    {header.column.columnDef.header as string}
                  </div>
                  <div className="flex flex-col gap-2 p-2" onClick={(e) => e.stopPropagation()}>
                    <Input
                      type="date"
                      value={(filterValue as [string, string])?.[0] ?? ''}
                      onChange={(e) => {
                        const val = e.target.value || undefined;
                        column.setFilterValue((old: [string, string]) => [val, old?.[1]]);
                      }}
                      className="h-8 bg-muted/30 text-[11px]"
                    />
                    <Input
                      type="date"
                      value={(filterValue as [string, string])?.[1] ?? ''}
                      onChange={(e) => {
                        const val = e.target.value || undefined;
                        column.setFilterValue((old: [string, string]) => [old?.[0], val]);
                      }}
                      className="h-8 bg-muted/30 text-[11px]"
                    />
                  </div>
                </>
              )}

              {/* Text Search Filter Section */}
              {filterType === 'text' && (
                <>
                  <DropdownMenuSeparator />
                  <div className="
                    flex items-center gap-1.5 px-2 py-1.5 text-[10px]
                    leading-none font-bold tracking-widest
                    text-muted-foreground/60 uppercase
                  "
                  >
                    <Search className="size-3" />
                    Search:
                    {' '}
                    {header.column.columnDef.header as string}
                  </div>
                  <div className="p-2" onClick={(e) => e.stopPropagation()}>
                    <DebouncedInput
                      placeholder={`Search ${header.column.columnDef.header as string}...`}
                      value={(filterValue as string) ?? ''}
                      onChange={(val) => column.setFilterValue(val)}
                      className="h-8 bg-muted/30 text-xs"
                    />
                  </div>
                </>
              )}

              {isFiltered && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => column.setFilterValue(undefined)}
                    className="
                      justify-center py-2 text-center text-xs font-bold
                      text-destructive
                      focus:text-destructive
                    "
                  >
                    Clear Column Filter
                  </DropdownMenuItem>
                </>
              )}

              {canPin && (
                <>
                  <DropdownMenuSeparator />
                  <div className="
                    px-2 py-1.5 text-[10px] leading-none font-bold
                    tracking-widest text-muted-foreground/60 uppercase
                  "
                  >
                    Pinning
                  </div>

                  <DropdownMenuCheckboxItem
                    checked={header.column.getIsPinned() === 'left'}
                    onCheckedChange={() =>
                      header.column.pin(header.column.getIsPinned() === 'left' ? false : 'left')}
                  >
                    <ArrowLeftToLine className="
                      mr-2 size-4 text-muted-foreground/70
                    "
                    />
                    Pin Left
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={header.column.getIsPinned() === 'right'}
                    onCheckedChange={() =>
                      header.column.pin(header.column.getIsPinned() === 'right' ? false : 'right')}
                  >
                    <ArrowRightToLine className="
                      mr-2 size-4 text-muted-foreground/70
                    "
                    />
                    Pin Right
                  </DropdownMenuCheckboxItem>

                  {header.column.getIsPinned() && (
                    <DropdownMenuItem
                      onClick={() => header.column.pin(false)}
                      className="
                        text-destructive
                        focus:text-destructive
                      "
                    >
                      <PinOff className="mr-2 size-4" />
                      Remove Pin
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
