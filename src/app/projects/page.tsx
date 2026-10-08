'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Search,
  Filter,
  Plus,
  Calendar,
  Layers,
  Sparkles,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Archive,
  Eye,
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
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Creative Projects Workspace
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your saved promotional campaigns, variations, and creative briefs.
          </p>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center gap-2 rounded-xl bg-gima-navy px-4 py-2.5 text-xs font-semibold text-white shadow-subtle hover:bg-gima-navy-light transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>New Creative</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-subtle">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === tab.value
                  ? 'bg-gima-navy text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-gima-navy focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProject(p)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-subtle hover:border-gima-navy/40 hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={p.thumbnail}
                    alt={p.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 rounded bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-white">
                    {p.creativeType} ({p.format})
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        p.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'In Review'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-gima-navy transition-colors line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {p.course}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.platforms.map((pl) => (
                      <span
                        key={pl}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600"
                      >
                        {pl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 bg-slate-50/50 text-[11px] text-slate-500">
                <span>{new Date(p.lastEdited).toLocaleDateString()}</span>
                <button
                  onClick={(e) => handleDelete(p.id, e)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded"
                  title="Delete project"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Polished Empty State (No fake history) */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {search ? 'No matching projects found' : 'Your project workspace is empty'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {search
              ? 'Try adjusting your search keyword or clearing status filters.'
              : 'Create promotional posters, carousel covers, or social campaigns in the Create studio and save them to build your library.'}
          </p>

          <Link
            href="/create"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gima-navy px-4 py-2 text-xs font-semibold text-white shadow-subtle hover:bg-gima-navy-light transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-gima-gold-light" />
            <span>Generate New Creative</span>
          </Link>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-elevated animate-fade-in overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedProject.name}</h3>
                <p className="text-xs text-slate-500">{selectedProject.course}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Preview image */}
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                <img
                  src={selectedProject.thumbnail}
                  alt={selectedProject.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Status & Format metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <span className="text-[10px] text-slate-400 block font-medium">Status</span>
                  <select
                    value={selectedProject.status}
                    onChange={(e) => handleStatusChange(selectedProject.id, e.target.value as ProjectStatus)}
                    className="mt-1 bg-transparent font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Review">In Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="rounded-lg bg-slate-50 p-2.5">
                  <span className="text-[10px] text-slate-400 block font-medium">Format</span>
                  <span className="font-bold text-slate-900">{selectedProject.creativeType} ({selectedProject.format})</span>
                </div>

                <div className="rounded-lg bg-slate-50 p-2.5">
                  <span className="text-[10px] text-slate-400 block font-medium">Campaign</span>
                  <span className="font-bold text-slate-900">{selectedProject.campaignType}</span>
                </div>

                <div className="rounded-lg bg-slate-50 p-2.5">
                  <span className="text-[10px] text-slate-400 block font-medium">Platforms</span>
                  <span className="font-bold text-slate-900 truncate block">{selectedProject.platforms.join(', ')}</span>
                </div>
              </div>

              {/* Creative Brief Details */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900">Creative Brief Specifications</h4>
                <p><strong>Headline:</strong> {selectedProject.request.headline || 'N/A'}</p>
                <p><strong>Call to Action:</strong> {selectedProject.request.cta || 'N/A'}</p>
                <p><strong>Audience:</strong> {selectedProject.request.audience}</p>
                {selectedProject.request.extraPrompt && (
                  <p><strong>Director Prompt:</strong> &ldquo;{selectedProject.request.extraPrompt}&rdquo;</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3.5 bg-slate-50">
              <span className="text-xs text-slate-500">
                Created: {new Date(selectedProject.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-xl bg-gima-navy px-4 py-2 text-xs font-semibold text-white hover:bg-gima-navy-light"
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
