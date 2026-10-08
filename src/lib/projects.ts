import { ProjectRecord, ProjectStatus } from './types';

const STORAGE_KEY = 'gima_ai_studio_projects';

export function getLocalProjects(): ProjectRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading projects:', e);
    return [];
  }
}

export function saveProject(project: ProjectRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const projects = getLocalProjects();
    const existingIdx = projects.findIndex((p) => p.id === project.id);
    if (existingIdx >= 0) {
      projects[existingIdx] = project;
    } else {
      projects.unshift(project);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving project:', e);
  }
}

export function deleteProject(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const projects = getLocalProjects().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Error deleting project:', e);
  }
}

export function updateProjectStatus(id: string, status: ProjectStatus): void {
  if (typeof window === 'undefined') return;
  try {
    const projects = getLocalProjects();
    const target = projects.find((p) => p.id === id);
    if (target) {
      target.status = status;
      target.lastEdited = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  } catch (e) {
    console.error('Error updating project status:', e);
  }
}
