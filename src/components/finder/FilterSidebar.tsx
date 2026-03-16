import { useState } from 'react';
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FinderFilters, INDUSTRIES, COMPANY_SIZES, SENIORITIES, BUDGET_SIGNALS } from '@/types/finder';
import { Badge } from '@/components/ui/badge';

interface Props {
  filters: FinderFilters;
  onChange: (f: FinderFilters) => void;
  resultCount: number;
}

function FilterGroup({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-border py-3">
      <CollapsibleTrigger className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
        {title}
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2.5 space-y-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}

export function FilterSidebar({ filters, onChange, resultCount }: Props) {
  const update = (patch: Partial<FinderFilters>) => onChange({ ...filters, ...patch });

  const toggleIndustry = (ind: string) => {
    const next = filters.industries.includes(ind)
      ? filters.industries.filter((i) => i !== ind)
      : [...filters.industries, ind];
    update({ industries: next });
  };

  const toggleSeniority = (s: string) => {
    const next = filters.seniorities.includes(s)
      ? filters.seniorities.filter((i) => i !== s)
      : [...filters.seniorities, s];
    update({ seniorities: next });
  };

  const reset = () =>
    onChange({ search: '', industries: [], companySize: '', seniorities: [], country: '', city: '', budgetSignal: '', sortBy: 'match' });

  const hasFilters = filters.industries.length > 0 || filters.companySize || filters.seniorities.length > 0 || filters.country || filters.city || filters.budgetSignal;

  return (
    <aside className="w-64 shrink-0 rounded-xl bg-card p-4 shadow-card h-fit sticky top-20 overflow-y-auto max-h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold">Filters</h2>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground" onClick={reset}>
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        )}
      </div>
      <div className="mb-3">
        <Badge variant="secondary" className="text-xs font-normal">
          Showing {resultCount} matches
        </Badge>
      </div>

      <FilterGroup title="Industry">
        <div className="space-y-1.5">
          {INDUSTRIES.map((ind) => (
            <label key={ind} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={filters.industries.includes(ind)}
                onCheckedChange={() => toggleIndustry(ind)}
              />
              {ind}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Company Size">
        <div className="space-y-1.5">
          {COMPANY_SIZES.map((size) => (
            <label key={size} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={filters.companySize === size}
                onCheckedChange={() => update({ companySize: filters.companySize === size ? '' : size })}
              />
              {size} employees
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Role / Seniority">
        <div className="space-y-1.5">
          {SENIORITIES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={filters.seniorities.includes(s)}
                onCheckedChange={() => toggleSeniority(s)}
              />
              {s}
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Location" defaultOpen={false}>
        <Input
          placeholder="Country"
          value={filters.country}
          onChange={(e) => update({ country: e.target.value })}
          className="h-8 text-sm"
        />
        <Input
          placeholder="City"
          value={filters.city}
          onChange={(e) => update({ city: e.target.value })}
          className="h-8 text-sm"
        />
      </FilterGroup>

      <FilterGroup title="Budget Signal" defaultOpen={false}>
        <Select value={filters.budgetSignal || 'all'} onValueChange={(v) => update({ budgetSignal: v === 'all' ? '' : v })}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            {BUDGET_SIGNALS.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterGroup>
    </aside>
  );
}
