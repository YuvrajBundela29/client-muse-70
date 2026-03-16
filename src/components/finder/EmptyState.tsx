import { SearchX } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 rounded-full bg-muted p-5">
        <SearchX className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-lg font-semibold">No matches yet</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Try adjusting your filters or broadening your search to discover more leads.
      </p>
    </div>
  );
}
