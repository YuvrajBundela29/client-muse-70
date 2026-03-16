import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Linkedin, Globe, MapPin, Bookmark, BookmarkCheck, Eye,
  ShieldCheck, ShieldAlert, Clock, Info, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Contact } from '@/types/finder';
import { MatchScoreArc } from './MatchScoreArc';
import { useCreditStore } from '@/lib/credit-store';
import { toast } from 'sonner';

interface Props {
  contact: Contact;
  onToggleSave: (id: string) => void;
  onRevealEmail: (id: string) => void;
  onRequestVerification: (id: string) => void;
  onOutOfCredits: () => void;
}

function freshnessConfig(f: Contact['dataFreshness']) {
  if (f === 'fresh') return { label: 'Fresh', color: 'bg-success', width: 'w-full' };
  if (f === 'aging') return { label: 'Aging', color: 'bg-warning', width: 'w-2/3' };
  return { label: 'Stale', color: 'bg-destructive', width: 'w-1/3' };
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
}

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Verified today';
  if (days === 1) return 'Verified 1 day ago';
  return `Verified ${days} days ago`;
}

export function ContactCard({ contact, onToggleSave, onRevealEmail, onRequestVerification, onOutOfCredits }: Props) {
  const [showWhy, setShowWhy] = useState(false);
  const credits = useCreditStore((s) => s.credits);
  const useCredit = useCreditStore((s) => s.useCredit);
  const fc = freshnessConfig(contact.dataFreshness);
  const initials = `${contact.firstName[0]}${contact.lastName[0]}`;

  const handleReveal = () => {
    if (credits <= 0) {
      onOutOfCredits();
      return;
    }
    if (useCredit()) {
      onRevealEmail(contact.id);
      toast.success('Email revealed! 1 credit used.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-2xl bg-card p-5 shadow-card transition-all duration-150 hover:shadow-card-hover hover:border-l-[3px] hover:border-l-primary border-l-[3px] border-l-transparent"
    >
      {/* Save bookmark */}
      <button
        onClick={() => onToggleSave(contact.id)}
        className="absolute right-4 top-4 text-muted-foreground hover:text-primary transition-colors"
        aria-label="Save to list"
      >
        {contact.saved
          ? <BookmarkCheck className="h-4.5 w-4.5 fill-primary text-primary" />
          : <Bookmark className="h-4.5 w-4.5" />}
      </button>

      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials}
          </div>
          <MatchScoreArc score={contact.aiMatchScore} size={44} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">
                {contact.firstName} {contact.lastName}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {contact.jobTitle} at <span className="font-medium text-foreground">{contact.companyName}</span>
              </p>
            </div>
          </div>

          {/* Intent signal */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] font-medium">
              {contact.intentSignal}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {contact.seniority}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {contact.companySize} emp
            </Badge>
          </div>

          {/* AI Insight */}
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            💡 {contact.aiInsight}
          </p>

          {/* Why this match */}
          <button
            onClick={() => setShowWhy(!showWhy)}
            className="mt-1 flex items-center gap-1 text-[11px] text-primary hover:underline"
          >
            <Info className="h-3 w-3" />
            Why this match?
            {showWhy ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showWhy && (
            <p className="mt-1 rounded-md bg-muted px-2.5 py-2 text-xs text-muted-foreground">
              {contact.matchExplanation}
            </p>
          )}

          {/* Contact info */}
          <div className="mt-3 space-y-1.5">
            {/* Email */}
            <div className="flex items-center gap-2 text-xs">
              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {contact.emailRevealed ? (
                <div>
                  <span className="font-medium">{contact.email}</span>
                  {contact.emailVerified && contact.lastVerifiedAt && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="h-3 w-3 text-success" />
                      <span className="text-[10px] text-success">{timeAgo(contact.lastVerifiedAt)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{maskEmail(contact.email)}</span>
                  <Button variant="outline" size="sm" className="h-6 gap-1 text-[10px] px-2" onClick={handleReveal}>
                    <Eye className="h-3 w-3" /> Reveal · 1 credit
                  </Button>
                </div>
              )}
            </div>

            {/* Verification badge or CTA */}
            {contact.emailVerified ? (
              <div className="flex items-center gap-1 text-[10px] text-success">
                <ShieldCheck className="h-3 w-3" /> Verified
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 text-[10px] text-warning px-1"
                onClick={() => onRequestVerification(contact.id)}
              >
                <ShieldAlert className="h-3 w-3" /> Request Verification
              </Button>
            )}

            {/* LinkedIn */}
            <a
              href={contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">LinkedIn Profile</span>
            </a>

            {/* Website */}
            <a
              href={contact.companyWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{contact.companyWebsite.replace('https://', '')}</span>
            </a>

            {/* Location */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{contact.location}</span>
            </div>
          </div>

          {/* Data freshness bar */}
          <div className="mt-3 flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${fc.color} ${fc.width} transition-all duration-300`} />
            </div>
            <span className="text-[10px] text-muted-foreground">{fc.label}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
