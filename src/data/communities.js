// DEMO/MOCK community data. Each community carries `interests` (matched
// against the user's profile.interests / INTERESTS taxonomy) and optional
// `priorities` it serves, so the dashboard can rank these per-profile
// instead of always showing the same fixed three.
export const COMMUNITIES = [
  { id: "c1", name: "Women in AI", category: "Technology", interests: ["AI & Technology"], priorities: ["Women-focused opportunities"], why: "Active peer group for women working in or studying AI.", url: "https://www.womeninai.co/" },
  { id: "c2", name: "Women Founders", category: "Entrepreneurship", interests: ["Entrepreneurship", "Business"], priorities: ["Women-focused opportunities", "Networking"], why: "Founders sharing funding leads and early-stage advice.", url: "https://www.womenfounders.org/" },
  { id: "c3", name: "Global STEM Network", category: "Research", interests: ["Research", "AI & Technology"], priorities: ["Networking"], why: "International community for women in research and academia.", url: "https://www.globalstemnetwork.org/" },
  { id: "c4", name: "Women in Leadership", category: "Career growth", interests: ["Leadership"], priorities: ["Career growth", "Women-focused opportunities"], why: "Focused on career progression into senior roles.", url: "https://www.womeninleadership.org/" },
  { id: "c5", name: "Design Sisterhood", category: "Design & Creativity", interests: ["Design & Creativity"], priorities: ["Networking", "Women-focused opportunities"], why: "Portfolio feedback and job leads for women in design.", url: "https://www.designsisterhood.com/" },
  { id: "c6", name: "Women in Finance Network", category: "Finance", interests: ["Finance"], priorities: ["Career growth", "Women-focused opportunities"], why: "Community for women in banking, investing, and fintech.", url: "https://www.wifn.org/" },
  { id: "c7", name: "Women in Medicine", category: "Healthcare", interests: ["Healthcare"], priorities: ["Mentorship", "Women-focused opportunities"], why: "Peer support and mentorship across medical careers.", url: "https://www.womeninmedicine.org/" },
  { id: "c8", name: "Women in Law", category: "Law", interests: ["Law"], priorities: ["Mentorship", "Women-focused opportunities"], why: "Network for law students and practicing attorneys.", url: "https://www.womeninlaw.org/" },
  { id: "c9", name: "EdTech Women", category: "Education", interests: ["Education"], priorities: ["Networking", "Women-focused opportunities"], why: "Educators and founders building the future of learning.", url: "https://www.edtechwomen.com/" },
  { id: "c10", name: "Women in Media & News", category: "Media", interests: ["Media"], priorities: ["Networking", "Women-focused opportunities"], why: "Journalists and creators supporting each other's work.", url: "https://www.wimn.org/" },
  { id: "c11", name: "Social Impact Collective", category: "Social Impact", interests: ["Social Impact"], priorities: ["Mentorship", "Networking"], why: "Changemakers working on nonprofits and social ventures.", url: "https://www.socialimpactcollective.org/" },
  { id: "c12", name: "Early Career Circle", category: "Career growth", interests: ["Business", "Leadership"], priorities: ["Mentorship", "Career growth"], why: "Peer support for people early in their careers.", url: "https://www.earlycareercircle.org/" },
];