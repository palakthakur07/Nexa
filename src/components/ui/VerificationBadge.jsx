import { ShieldCheck, Clock, ShieldAlert } from "lucide-react";
import Badge from "./Badge.jsx";

// Renders ONLY off opportunity.verificationStatus / organization.verificationStatus
// as read from the backend — never inferred, never defaulted to "verified"
// just because a field is missing. See protect_opportunity_verification() in
// 002_opportunity_engine.sql for why the client can trust this value.
export function OpportunityVerificationBadge({ status }) {
  if (status === "PUBLISHED" || status === "VERIFIED") {
    return <Badge tone="success"><ShieldCheck size={11} /> Verified opportunity</Badge>;
  }
  if (status === "PENDING_REVIEW") {
    return <Badge tone="neutral"><Clock size={11} /> Pending review</Badge>;
  }
  if (status === "REJECTED") {
    return <Badge tone="neutral"><ShieldAlert size={11} /> Rejected</Badge>;
  }
  if (status === "EXPIRED") {
    return <Badge tone="neutral">Expired</Badge>;
  }
  return null; // DRAFT — not shown publicly
}

export function OrganizationVerificationBadge({ status }) {
  if (status === "VERIFIED") {
    return <Badge tone="success"><ShieldCheck size={11} /> Verified organization</Badge>;
  }
  if (status === "PENDING_VERIFICATION") {
    return <Badge tone="neutral"><Clock size={11} /> Verification pending</Badge>;
  }
  if (status === "SUSPENDED") {
    return <Badge tone="neutral"><ShieldAlert size={11} /> Suspended</Badge>;
  }
  return null; // UNVERIFIED — no badge, not a false negative signal either
}
