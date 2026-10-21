'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  FolderKanban,
  BookOpen,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { getKnowledgeStats, getBrandConfig } from '@/lib/knowledge';
import { getLocalProjects } from '@/lib/projects';
import { getActivityEvents } from '@/lib/activity';
import { ProjectRecord, ActivityEvent } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [brand, setBrand] = useState<any>(null);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    setStats(getKnowledgeStats());
    setBrand(getBrandConfig());
    setProjects(getLocalProjects());
    setActivities(getActivityEvents());
  }, []);

  const quickCreateActions = [
    { title: 'Course Promotion', type: 'Course Promotion', desc: 'Campaign for ROHP 101–106 Curriculum & Module 7', tag: 'High Impact' },
    { title: 'Free Course Promotion', type: 'Free Course Promotion', desc: 'Promote Theories of Aging & Brain Development clinical PDFs', tag: 'Lead Magnet' },
    { title: 'Social Media Post', type: 'Social Media Campaign', desc: 'Square 1:1 or 4:5 optimized for Instagram, LinkedIn & Facebook', tag: 'Engagement' },
    { title: 'Clinical Poster', type: 'Educational Awareness', desc: 'Print & A4 Clinical Infographic for institutional display', tag: 'Educational' },
    { title: 'Campaign Series', type: 'Brand Awareness', desc: 'Multi-platform cohesive campaign with shared visual direction', tag: 'Brand' },
    { title: 'Custom Creative', type: 'Custom', desc: 'Freeform creative direction with advanced custom prompts', tag: 'Flexible' },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* Editorial Hero Area */}
      <section className="relative overflow-hidden rounded-3xl border border-gima-navy/30 bg-gradient-to-br from-gima-navy via-[#162e4d] to-gima-navy-dark text-white p-7 sm:p-12 shadow-elevated">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gima-gold/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-gima-clinical-teal/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-gima-gold/40 bg-gima-gold/15 px-4 py-1.5 text-xs sm:text-sm font-bold text-gima-gold-light tracking-wide">
            <span className="h-2 w-2 rounded-full bg-gima-gold-light animate-pulse" />
            ADMINISTRATIVE CREATIVE SUITE
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Create something worthy of GIMA.
          </h2>

          <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl">
            Turn authoritative GIMA clinical knowledge into polished promotional campaigns, posters, and social creatives tailored exclusively for Healthcare Professionals.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2.5 rounded-xl bg-gima-gold px-6 py-3.5 text-sm sm:text-base font-bold text-gima-navy-dark shadow-card hover:bg-gima-gold-light transition-all active:scale-[0.98] min-h-[48px]"
            >
              <Sparkles className="h-5 w-5" />
              <span>Create Creative</span>
            </Link>

            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3.5 text-sm sm:text-base font-semibold text-white hover:bg-white/20 transition-colors min-h-[48px]"
            >
              <FolderKanban className="h-5 w-5 text-slate-300" />
              <span>Browse Projects</span>
            </Link>

            <Link
              href="/knowledge"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3.5 text-sm sm:text-base font-semibold text-white hover:bg-white/20 transition-colors min-h-[48px]"
            >
              <BookOpen className="h-5 w-5 text-slate-300" />
              <span>Explore Knowledge</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Real Knowledge Coverage Status */}
      <section aria-labelledby="coverage-heading" className="space-y-3">
        <h3 id="coverage-heading" className="sr-only">Verified Knowledge Coverage</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle flex items-start gap-4.5 hover:shadow-card transition-shadow">
            <div className="rounded-xl bg-blue-50 p-3.5 text-blue-700 shrink-0">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-3xl font-extrabold text-slate-900">{stats?.webSourcesCount || 27}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Indexed
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 mt-1">Website Routes Ingested</p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                ROHP 101–106, Mod 7, Blog & Free Courses
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle flex items-start gap-4.5 hover:shadow-card transition-shadow">
            <div className="rounded-xl bg-amber-50 p-3.5 text-amber-800 shrink-0">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-3xl font-extrabold text-slate-900">{stats?.pdfSourcesCount || 12}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-950">
                  Authoritative
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 mt-1">Free-Course PDFs Processed</p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                299 pages extracted from Theories of Aging
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle flex items-start gap-4.5 hover:shadow-card transition-shadow">
            <div className="rounded-xl bg-teal-50 p-3.5 text-teal-800 shrink-0">
              <ImageIcon className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-3xl font-extrabold text-slate-900">45</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-950">
                  Verified
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 mt-1">GIMA Reference Assets</p>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                Logos, Dr. Meschino portraits, clinical banners
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Create Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Quick Create Formats</h3>
            <p className="text-sm text-slate-600 font-medium">Launch a new creative workflow with pre-configured campaign parameters</p>
          </div>
          <Link href="/create" className="text-sm font-bold text-gima-navy hover:underline flex items-center gap-1.5 self-start sm:self-auto py-1">
            <span>Custom Specification</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {quickCreateActions.map((qc) => (
            <Link
              key={qc.title}
              href={`/create?campaignType=${encodeURIComponent(qc.type)}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 hover:border-gima-navy/50 hover:shadow-card transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold text-slate-900 group-hover:text-gima-navy transition-colors">
                    {qc.title}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    {qc.tag}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed font-normal">
                  {qc.desc}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-1.5 text-sm font-bold text-gima-navy group-hover:translate-x-1 transition-transform">
                <span>Start creative</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured GIMA Clinical Foundation */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Authoritative GIMA Knowledge</h3>
            <p className="text-sm text-slate-600 font-medium">Directly accessible curriculum and research documents</p>
          </div>
          <Link href="/knowledge" className="text-sm font-bold text-gima-navy hover:underline self-start sm:self-auto py-1">
            View All 39 Records &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* ROHP Feature Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle flex flex-col justify-between hover:shadow-card transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-900 uppercase">
                  FLAGSHIP PROGRAM
                </span>
                <span className="text-xs text-slate-500 font-semibold">ROHP / RNCP</span>
              </div>
              <h4 className="mt-3 text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Advanced Nutritional Medicine and Sports Nutrition Specialist
              </h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Qualifying curriculum for Registered Orthomolecular Health Practitioner. Comprises 6 rigorous didactic modules plus Module 7 clinical case study assignment.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">6 Core Courses + Mod 7</span>
              <Link href="/create?course=ROHP Certification" className="font-bold text-gima-navy hover:underline">
                Promote Program &rarr;
              </Link>
            </div>
          </div>

          {/* Theories of Aging PDF Collection */}
          <div className="rounded-2xl border border-amber-300 bg-amber-50/40 p-6 shadow-subtle flex flex-col justify-between hover:shadow-card transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-amber-200/80 px-2.5 py-1 text-xs font-bold text-amber-950 uppercase">
                  FREE COURSE COLLECTION
                </span>
                <span className="text-xs text-amber-900 font-bold">12 PDFs</span>
              </div>
              <h4 className="mt-3 text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Theories of Aging — Free Online Course
              </h4>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                Authoritative lecture slides & clinical reviews on Glutathione, Free Radicals, Telomeres, Melatonin, L-Carnitine, and Heavy Metal Chelation authored by Dr. James Meschino.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-amber-200 flex items-center justify-between text-sm">
              <span className="text-amber-950 font-semibold">Author: Dr. Meschino</span>
              <Link href="/create?course=Theories of Aging" className="font-bold text-gima-navy hover:underline">
                Create Poster &rarr;
              </Link>
            </div>
          </div>

          {/* Brain Development Course */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle flex flex-col justify-between hover:shadow-card transition-shadow">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-950 uppercase">
                  FREE COURSE
                </span>
                <span className="text-xs text-slate-500 font-semibold">Neurology</span>
              </div>
              <h4 className="mt-3 text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Nutritional Medicine in Brain Development
              </h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Focusing on essential fatty acids, prenatal choline, neurotransmitter precursors, and neurological protection across pediatric and adult development.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Live Website Source</span>
              <Link href="/create?course=Nutritional Medicine in Brain Development" className="font-bold text-gima-navy hover:underline">
                Create Campaign &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Lower Section: Recent Projects & Operational Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle flex flex-col">
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Projects</h3>
              <p className="text-xs sm:text-sm text-slate-600">Saved promotional campaigns and generated previews</p>
            </div>
            <Link href="/projects" className="text-sm font-bold text-gima-navy hover:underline">
              View All ({projects.length})
            </Link>
          </div>

          {projects.length > 0 ? (
            <div className="space-y-3.5 flex-1">
              {projects.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="h-14 w-14 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-sm sm:text-base font-bold text-slate-900">{p.name}</p>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">{p.course} • {p.format}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
              <FolderKanban className="h-10 w-10 text-slate-400 mb-3" />
              <p className="text-base font-bold text-slate-900">No projects saved yet</p>
              <p className="text-sm text-slate-600 max-w-sm mt-1.5 leading-relaxed">
                Generate your first promotional poster or social campaign using the Create studio to view it here.
              </p>
              <Link
                href="/create"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gima-navy px-4 py-2.5 text-sm font-bold text-white hover:bg-gima-navy-light transition-colors min-h-[44px]"
              >
                <Sparkles className="h-4 w-4 text-gima-gold-light" />
                <span>Create First Creative</span>
              </Link>
            </div>
          )}
        </div>

        {/* Operational Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle flex flex-col">
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Operational Log</h3>
              <p className="text-xs sm:text-sm text-slate-600">Real system pipeline events and content ingestion</p>
            </div>
            <Link href="/activity" className="text-sm font-bold text-gima-navy hover:underline">
              Full Activity &rarr;
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {activities.slice(0, 3).map((act) => (
              <div key={act.id} className="flex items-start gap-3.5 text-sm">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-gima-navy font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{act.title}</p>
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-1">{act.description}</p>
                  <span className="text-xs text-slate-500 mt-1 inline-block font-medium">
                    {new Date(act.timestamp).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
