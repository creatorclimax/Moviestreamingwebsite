import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPage?: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, maxPage = 50 }: PaginationProps) {
  const actualMaxPage = Math.min(totalPages, maxPage);

  if (actualMaxPage <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <span className="text-sm text-[var(--muted-foreground)] px-2">
        Page {currentPage} of {actualMaxPage}
      </span>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= actualMaxPage}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
