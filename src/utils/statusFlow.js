export const STATUS_FLOW = {
  Applied:   ["Interview", "Rejected"],
  Interview: ["Passed", "Rejected"],
  Passed:    [],
  Rejected:  [],
};

export const STATUS_COLORS = {
  Applied:   { bg: "#e8f4fd", text: "#1a6fa8", border: "#90cdf4" },
  Interview: { bg: "#fef3c7", text: "#92400e", border: "#f6d860" },
  Passed:    { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  Rejected:  { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
};

export const STATUSES = ["Applied", "Interview", "Passed", "Rejected"];

export const POSITIONS = [
  "Frontend Developer", "Backend Developer", "Fullstack Developer",
  "DevOps Engineer", "UX/UI Designer", "Product Manager",
  "QA Engineer", "Data Engineer", "Data Scientist", "Business Analyst",
];
