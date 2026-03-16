import { useState, useMemo, useCallback } from 'react';
import { Search, Download, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppHeader } from '@/components/shared/AppHeader';
import { FilterSidebar } from '@/components/finder/FilterSidebar';
import { ContactCard } from '@/components/finder/ContactCard';
import { OnboardingTooltip } from '@/components/finder/OnboardingTooltip';
import { UpgradeModal } from '@/components/finder/UpgradeModal';
import { EmptyState } from '@/components/finder/EmptyState';
import { Contact, FinderFilters, PRESETS } from '@/types/finder';
import { generateMockContacts } from '@/lib/mock-contacts';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const INITIAL_FILTERS: FinderFilters = {
  search: '', industries: [], companySize: '', seniorities: [],
  country: '', city: '', budgetSignal: '', sortBy: 'match',
};

const PAGE_SIZE = 20;

export default function Finder() {
  const [contacts, setContacts] = useState<Contact[]>(() => generateMockContacts(80));
  const [filters, setFilters] = useState<FinderFilters>(INITIAL_FILTERS);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...contacts];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.jobTitle.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q)
      );
    }
    if (filters.industries.length > 0) {
      result = result.filter((c) => filters.industries.includes(c.industry));
    }
    if (filters.companySize) {
      result = result.filter((c) => c.companySize === filters.companySize);
    }
    if (filters.seniorities.length > 0) {
      result = result.filter((c) => filters.seniorities.includes(c.seniority));
    }
    if (filters.country) {
      result = result.filter((c) => c.country.toLowerCase().includes(filters.country.toLowerCase()));
    }
    if (filters.city) {
      result = result.filter((c) => c.city.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.budgetSignal) {
      result = result.filter((c) => c.budgetSignal === filters.budgetSignal);
    }

    if (filters.sortBy === 'match') result.sort((a, b) => b.aiMatchScore - a.aiMatchScore);
    else if (filters.sortBy === 'recent') result.sort((a, b) => (b.lastVerifiedAt || '').localeCompare(a.lastVerifiedAt || ''));
    else if (filters.sortBy === 'size') {
      const sizeOrder: Record<string, number> = { '1–10': 1, '11–50': 2, '51–200': 3, '201–1000': 4, '1000+': 5 };
      result.sort((a, b) => (sizeOrder[b.companySize] || 0) - (sizeOrder[a.companySize] || 0));
    }

    return result;
  }, [contacts, filters]);

  const paginated = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = paginated.length < filtered.length;

  const toggleSave = useCallback((id: string) => {
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, saved: !c.saved } : c));
  }, []);

  const revealEmail = useCallback((id: string) => {
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, emailRevealed: true } : c));
  }, []);

  const requestVerification = useCallback((id: string) => {
    toast.success('Verification requested! We\'ll notify you when it\'s ready.');
  }, []);

  const applyPreset = (key: string) => {
    const preset = PRESETS[key];
    setFilters({ ...INITIAL_FILTERS, ...preset });
    setPage(1);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Title', 'Company', 'Industry', 'Email', 'LinkedIn', 'Location', 'Match Score', 'Intent Signal'];
    const rows = filtered.map((c) => [
      `${c.firstName} ${c.lastName}`, c.jobTitle, c.companyName, c.industry,
      c.emailRevealed ? c.email : '(hidden)', c.linkedinUrl, c.location,
      c.aiMatchScore.toString(), c.intentSignal,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showCredits />
      <OnboardingTooltip />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      <div className="container py-6">
        {/* Quick search + presets */}
        <div className="mb-5">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by company, role, industry or keyword..."
              className="h-11 pl-10 text-sm"
              value={filters.search}
              onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setPage(1); }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map((key) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => applyPreset(key)}
              >
                {key}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden md:block">
            <FilterSidebar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} resultCount={filtered.length} />
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Sort by:</span>
                {(['match', 'recent', 'size'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilters((f) => ({ ...f, sortBy: s }))}
                    className={`text-xs font-medium transition-colors ${filters.sortBy === s ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {s === 'match' ? 'Best Match' : s === 'recent' ? 'Most Recent' : 'Company Size'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{filtered.length} results</span>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={exportCSV}>
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {paginated.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onToggleSave={toggleSave}
                      onRevealEmail={revealEmail}
                      onRequestVerification={requestVerification}
                      onOutOfCredits={() => setUpgradeOpen(true)}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-6 flex justify-center">
                    <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                      Load more ({filtered.length - paginated.length} remaining)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
