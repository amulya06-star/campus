function filterMarketplaceProjects(projects, options = {}) {
  const normalizedQuery = (options.query || "").trim().toLowerCase();
  let filtered = (projects || []).filter((project) => project.status === "open");
  if (options.category && options.category !== "All projects") filtered = filtered.filter((project) => project.category === options.category);
  if (normalizedQuery) filtered = filtered.filter((project) => `${project.title || ""} ${project.description || ""} ${(project.technologies || []).join(" ")} ${project.category || ""}`.toLowerCase().includes(normalizedQuery));
  if (options.sort === "Newest first") return [...filtered].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  if (options.sort === "Budget: high to low") return [...filtered].sort((a, b) => b.budget - a.budget);
  return filtered;
}
function toggleSavedId(saved, id) { return saved.includes(id) ? saved.filter((savedId) => savedId !== id) : [...saved, id]; }
function getProgressPercentage(requirements = []) { if (!requirements.length) return 0; return Math.round(requirements.filter((requirement) => requirement.done).length / requirements.length * 100); }
export { filterMarketplaceProjects, getProgressPercentage, toggleSavedId };
