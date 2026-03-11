import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface PaginationProps {
  total: number;
  currentPage: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const DEFAULT_OPTIONS = [10, 20, 50];

const Pagination: FC<PaginationProps> = ({
  total,
  currentPage,
  pageSize,
  pageSizeOptions = DEFAULT_OPTIONS,
  onPageChange,
  onPageSizeChange,
}) => {
  if (total <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safeCurrent = Math.min(Math.max(currentPage, 1), totalPages);
  const start = (safeCurrent - 1) * pageSize + 1;
  const end = Math.min(start + pageSize - 1, total);

  const canPrev = safeCurrent > 1;
  const canNext = safeCurrent < totalPages;

  const buildPageRange = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }

    let startPage = Math.max(1, safeCurrent - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i += 1) pages.push(i);
    return pages;
  };

  const pages = buildPageRange();

  const handleSizeChange = (value: string) => {
    const size = Number(value);
    if (!Number.isNaN(size) && size > 0) {
      onPageSizeChange(size);
      onPageChange(1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page === safeCurrent) return;
    onPageChange(page);
  };

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-white/70 md:flex-row md:items-center md:justify-between">
      {/* Left: range info */}
      <div className="order-3 md:order-1">
        顯示{' '}
        <span className="font-semibold text-[#C9A96E]">
          {start}-{end}
        </span>{' '}
        / 共{' '}
        <span className="font-semibold text-[#C9A96E]">
          {total}
        </span>{' '}
        條
      </div>

      {/* Middle: page size select */}
      <div className="order-1 flex items-center gap-2 md:order-2">
        <span className="whitespace-nowrap">每頁顯示</span>
        <Select value={String(pageSize)} onValueChange={handleSizeChange}>
          <SelectTrigger size="sm" className="min-w-[80px] border-[#C9A96E]/30 bg-black/40 text-xs text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0A1628] text-xs text-white">
            {pageSizeOptions.map((opt) => (
              <SelectItem key={opt} value={String(opt)}>
                {opt} 條
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right: pager */}
      <div className="order-2 flex items-center justify-end gap-1 md:order-3">
        <button
          type="button"
          onClick={() => canPrev && handlePageClick(safeCurrent - 1)}
          disabled={!canPrev}
          className="flex h-8 w-8 items-center justify-center rounded-md border text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            borderColor: 'rgba(201,169,110,0.3)',
            color: 'rgba(237,232,223,0.85)',
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages[0] > 1 && (
          <>
            <button
              type="button"
              onClick={() => handlePageClick(1)}
              className="flex h-8 min-w-8 items-center justify-center rounded-md border text-xs transition-colors"
              style={{
                borderColor: 'rgba(201,169,110,0.3)',
                color: 'rgba(237,232,223,0.85)',
                backgroundColor: 'rgba(0,0,0,0.2)',
              }}
            >
              1
            </button>
            {pages[0] > 2 && (
              <span className="px-1 text-xs text-white/40">…</span>
            )}
          </>
        )}
        {pages.map((page) => {
          const isActive = page === safeCurrent;
          return (
            <button
              key={page}
              type="button"
              onClick={() => handlePageClick(page)}
              className="flex h-8 min-w-8 items-center justify-center rounded-md border text-xs font-medium transition-colors"
              style={
                isActive
                  ? {
                      background:
                        'linear-gradient(135deg, #C9A96E 0%, #a8883a 100%)',
                      color: '#0A1628',
                      borderColor: '#C9A96E',
                    }
                  : {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      color: 'rgba(237,232,223,0.85)',
                      borderColor: 'rgba(201,169,110,0.3)',
                    }
              }
            >
              {page}
            </button>
          );
        })}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="px-1 text-xs text-white/40">…</span>
            )}
            <button
              type="button"
              onClick={() => handlePageClick(totalPages)}
              className="flex h-8 min-w-8 items-center justify-center rounded-md border text-xs transition-colors"
              style={{
                borderColor: 'rgba(201,169,110,0.3)',
                color: 'rgba(237,232,223,0.85)',
                backgroundColor: 'rgba(0,0,0,0.2)',
              }}
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => canNext && handlePageClick(safeCurrent + 1)}
          disabled={!canNext}
          className="flex h-8 w-8 items-center justify-center rounded-md border text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            borderColor: 'rgba(201,169,110,0.3)',
            color: 'rgba(237,232,223,0.85)',
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

