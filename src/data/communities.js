// REAL communities only. Each entry below was individually verified (web
// search + fetch, Aug 2026) to be an actual organization at the URL listed —
// no placeholder/guessed domains. Each carries `interests` (matched against
// the user's profile.interests / INTERESTS taxonomy) and optional
// `priorities` it serves, so the dashboard can rank these per-profile
// instead of always showing the same fixed three.
//
// If you add a community here, verify the URL actually resolves to that
// org before committing — see supabase/migrations/011_real_verified_communities.sql
// for the same fix applied to the live `communities` table.
export const COMMUNITIES = [
  { id: "c1", name: "Women in AI", category: "Technology", interests: ["AI & Technology"], priorities: ["Women-focused opportunities"], why: "Global nonprofit community for women working in or studying AI.", url: "https://www.womeninai.co/" },
  { id: "c2", name: "Women Founders Network", category: "Entrepreneurship", interests: ["Entrepreneurship", "Business"], priorities: ["Women-focused opportunities", "Networking"], why: "Nonprofit providing education, coaching, and funding access for women founders.", url: "https://www.womenfoundersnetwork.org/" },
  { id: "c3", name: "Association for Women in Science", category: "Research", interests: ["Research", "AI & Technology"], priorities: ["Networking"], why: "National advocacy organization and peer network for women across every STEM discipline.", url: "https://awis.org/" },
  { id: "c4", name: "Chief", category: "Career growth", interests: ["Leadership"], priorities: ["Career growth", "Women-focused opportunities"], why: "Private membership network and executive coaching community for senior women leaders.", url: "https://chief.com/" },
  { id: "c5", name: "Ladies, Wine & Design", category: "Design & Creativity", interests: ["Design & Creativity"], priorities: ["Networking", "Women-focused opportunities"], why: "Global chapter-based nonprofit offering mentorship and portfolio reviews for women in creative fields.", url: "https://ladieswinedesign.com/" },
  { id: "c6", name: "Financial Women's Association", category: "Finance", interests: ["Finance"], priorities: ["Career growth", "Women-focused opportunities"], why: "Professional association since 1956 for women in banking, investing, and fintech.", url: "https://www.fwa.org/" },
  { id: "c7", name: "American Medical Women's Association", category: "Healthcare", interests: ["Healthcare"], priorities: ["Mentorship", "Women-focused opportunities"], why: "The oldest multispecialty organization advancing women physicians and medical students.", url: "https://amwa-doc.org/" },
  { id: "c8", name: "National Association of Women Lawyers", category: "Law", interests: ["Law"], priorities: ["Mentorship", "Women-focused opportunities"], why: "National organization advancing women in the legal profession since 1899.", url: "https://www.nawl.org/" },
  { id: "c9", name: "EdTech Women", category: "Education", interests: ["Education"], priorities: ["Networking", "Women-focused opportunities"], why: "Educators and founders building the future of learning, with chapters in multiple cities.", url: "https://www.edtechwomen.com/" },
  { id: "c10", name: "Alliance for Women in Media", category: "Media", interests: ["Media"], priorities: ["Networking", "Women-focused opportunities"], why: "The longest-established professional association advancing women across broadcasting and media.", url: "https://allwomeninmedia.org/" },
  { id: "c11", name: "Vital Voices", category: "Social Impact", interests: ["Social Impact"], priorities: ["Mentorship", "Networking"], why: "Global network investing in women leaders driving human rights and economic change.", url: "https://www.vitalvoices.org/" },
  { id: "c12", name: "Ellevate Network", category: "Career growth", interests: ["Business", "Leadership"], priorities: ["Mentorship", "Career growth"], why: "Global professional women's network with peer mentoring and local chapters, from early career to executive.", url: "https://ellevatenetwork.com/" },
];