import React from 'react';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-border/20">
      <div className="flex items-center justify-between">
        <div className="text-sm text-foreground/60">
          {t('ui.datatable.page', currentPage, totalPages)}
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            variant="secondary"
            size="sm"
          >
            {t('ui.datatable.previous')}
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                variant={currentPage === page ? 'primary' : 'secondary'}
                size="sm"
              >
                {page}
              </Button>
            );
          })}

          <Button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            variant="secondary"
            size="sm"
          >
            {t('ui.datatable.next')}
          </Button>
        </div>
      </div>
    </div>
  );
};
