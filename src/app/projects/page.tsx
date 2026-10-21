'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Search,
  Plus,
  Trash2,
  Sparkles,
  X
} from 'lucide-react';
import { getLocalProjects, deleteProject, updateProjectStatus } from '@/lib/projects';
import { ProjectRecord, ProjectStatus } from '@/lib/types';

const statusTabs: { label: string; value: string }[] = [
  { label: 'All Projects', value: 'All' },
  { label: 'Draft', value: 'Draft' },
  { label: 'In Review', value: 'In Review' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Archived', value: 'Archived' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null);

  useEffect(() => {
    setProjects(getLocalProjects());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this project from your local workspace?')) {
      deleteProject(id);
      setProjects(getLocalProjects());
      if (selectedProject?.id === id) setSelectedProject(null);
    }
  };

  const handleStatusChange = (id: string, status: ProjectStatus) => {
    updateProjectStatus(id, status);
    setProjects(getLocalProjects());
    if (selectedProject && selectedProject.id === id) {
      setSelectedProject({ ...selectedProject, status });
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCourse = p.course.toLowerCase().includes(q);
      const matchType = p.creativeType.toLowerCase().includes(q);
      if (!matchName && !matchCourse && !matchType) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Creative Projects Workspace
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Manage your saved promotional campaigns, variations, and creative briefs.
          </p>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center gap-2 rounded-xl bg-gima-navy px-5 py-2.5 text-sm font-bold text-white shadow-subtle hover:bg-gima-navy-light transition-all active:scale-[0.98] min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          <span>New Creative</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors min-h-[40px] ${
                statusFilter === tab.value
                  ? 'bg-gima-navy text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/70 pl-10 pr-4 py-2 text-sm sm:text-base text-slate-900 placeholder:text-slate-500 focus:border-gima-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-gima-navy/20"
          />
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProject(p)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-subtle hover:border-gima-navy/50 hover:shadow-card transition-all flex flex-col justify-between"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedProject(p);
                }
              }}
              aria-label={`Open project details for ${p.name}`}
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={p.thumbnail}
                    alt={p.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 rounded-md bg-black/70 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white">
                    {p.creativeType} ({p.format})
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        p.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-900'
                          : p.status === 'In Review'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-2.5">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-gima-navy transition-colors line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-sm text-slate-600 font-medium line-clamp-1">
                    {p.course}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.platforms.map((pl) => (
                      <span
                        key={pl}
                        className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700"
                      >
                        {pl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50/60 text-xs sm:text-sm text-slate-600 font-medium">
                <span>{new Date(p.lastEdited).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                <button
                  onClick={(e) => handleDelete(p.id, e)}
                  className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-slate-200 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Delete project"
                  aria-label="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Polished Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
            <FolderKanban className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {search ? 'No matching projects found' : 'Your project workspace is empty'}
          </h3>
          <p className="mt-2 text-sm text-slate-600 max-w-md leading-relaxed">
            {search
              ? 'Try adjusting your search keyword or clearing status filters.'
              : 'Create promotional posters, carousel covers, or social campaigns in the Create studio and save them to build your library.'}
          </p>

          <Link
            href="/create"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gima-navy px-5 py-2.5 text-sm font-bold text-white shadow-subtle hover:bg-gima-navy-light transition-all min-h-[44px]"
          >
            <Sparkles className="h-4 w-4 text-gima-gold-light" />
            <span>Generate New Creative</span>
          </Link>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-detail-title"
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-elevated overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4.5 bg-slate-50/50">
              <div>
                <h3 id="project-detail-title" className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {selectedProject.name}
                </h3>
                <p className="text-sm text-slate-600 font-medium mt-0.5">{selectedProject.course}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                aria-label="Close project modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Preview image */}
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                <img
                  src={selectedProject.thumbnail}
                  alt={selectedProject.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Status & Format metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                  <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">Status</span>
                  <select
                    value={selectedProject.status}
                    onChange={(e) => handleStatusChange(selectedProject.id, e.target.value as ProjectStatus)}
                    className="mt-1 bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                  <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">Format</span>
                  <span className="font-bold text-slate-900 block mt-1">{selectedProject.creativeType} ({selectedProject.format})</span>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                  <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">Campaign</span>
                  <span className="font-bold text-slate-900 block mt-1 truncate">{selectedProject.campaignType}</span>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                  <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">Platforms</span>
                  <span className="font-bold text-slate-900 truncate block mt-1">{selectedProject.platforms.join(', ')}</span>
                </div>
              </div>

              {/* Creative Brief Details */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3 text-sm">
                <h4 className="font-bold text-slate-900 text-base">Creative Brief Specifications</h4>
                <p className="text-slate-700"><strong>Headline:</strong> {selectedProject.request.headline || 'N/A'}</p>
                <p className="text-slate-700"><strong>Call to Action:</strong> {selectedProject.request.cta || 'N/A'}</p>
                <p className="text-slate-700"><strong>Audience:</strong> {selectedProject.request.audience}</p>
                {selectedProject.request.extraPrompt && (
                  <p className="text-slate-700"><strong>Director Prompt:</strong> &ldquo;{selectedProject.request.extraPrompt}&rdquo;</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
              <span className="text-sm text-slate-600 font-medium">
                Created: {new Date(selectedProject.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </span>
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-xl bg-gima-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-gima-navy-light min-h-[44px] transition-colors"
              >
                Close Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
