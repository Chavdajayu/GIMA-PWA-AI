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
  GraduationCap,
  Layers,
  Clock,
  Compass,
  FileCheck,
  ShieldAlert
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
    { title: 'Course Promotion', type: 'Course Promotion', desc: 'Campaign for ROHP 101–106 Curriculum', tag: 'High Impact' },
    { title: 'Free Course Promotion', type: 'Free Course Promotion', desc: 'Target Theories of Aging & Brain Development', tag: 'Lead Magnet' },
    { title: 'Social Media Post', type: 'Social Media Campaign', desc: 'Square 1:1 or 4:5 for Instagram & LinkedIn', tag: 'Engagement' },
    { title: 'Clinical Poster', type: 'Educational Awareness', desc: 'Print & A4 Clinical Infographic Format', tag: 'Educational' },
    { title: 'Campaign Series', type: 'Brand Awareness', desc: 'Multi-platform cohesive campaign', tag: 'Brand' },
    { title: 'Custom Creative', type: 'Custom', desc: 'Freeform direction with custom prompt', tag: 'Flexible' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Editorial Hero Area */}
      <section className="relative overflow-hidden rounded-2xl border border-gima-navy/20 bg-gradient-to-b from-gima-navy to-gima-navy-dark text-white p-6 sm:p-10 shadow-card">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gima-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gima-clinical-teal/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-gima-gold/30 bg-gima-gold/10 px-3 py-1 text-xs font-semibold text-gima-gold-light tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-gima-gold-light animate-pulse" />
            ADMINISTRATIVE CREATIVE SUITE
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Create something worthy of GIMA.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Turn authoritative GIMA clinical knowledge into polished promotional campaigns, posters, and social creatives tailored exclusively for Healthcare Professionals.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-xl bg-gima-gold px-5 py-2.5 text-sm font-semibold text-gima-navy-dark shadow-subtle hover:bg-gima-gold-light transition-all active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Create Creative</span>
            </Link>

            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <FolderKanban className="h-4 w-4 text-slate-300" />
              <span>Browse Projects</span>
            </Link>

            <Link
              href="/knowledge"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <BookOpen className="h-4 w-4 text-slate-300" />
              <span>Explore Knowledge</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Real Knowledge Coverage Status */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle flex items-start gap-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">{stats?.webSourcesCount || 27}</span>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Indexed
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">Website Routes Ingested</p>
            <p className="text-[11px] text-slate-500 mt-1">
              ROHP 101–106, Mod 7, Blog & Free Courses
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle flex items-start gap-4">
          <div className="rounded-lg bg-amber-50 p-3 text-amber-700">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">{stats?.pdfSourcesCount || 12}</span>
              <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                Authoritative
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">Free-Course PDFs Processed</p>
            <p className="text-[11px] text-slate-500 mt-1">
              299 pages extracted from Theories of Aging
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle flex items-start gap-4">
          <div className="rounded-lg bg-teal-50 p-3 text-teal-700">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">45</span>
              <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-800">
                Verified
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">GIMA Reference Assets</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Logos, Dr. Meschino portraits, clinical banners
            </p>
          </div>
        </div>
      </section>

      {/* Quick Create Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Quick Create Formats</h3>
            <p className="text-xs text-slate-500">Launch a new creative workflow with pre-configured campaign parameters</p>
          </div>
          <Link href="/create" className="text-xs font-semibold text-gima-navy hover:underline flex items-center gap-1">
            Custom Specification <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {quickCreateActions.map((qc) => (
            <Link
              key={qc.title}
              href={`/create?campaignType=${encodeURIComponent(qc.type)}`}
              className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4.5 hover:border-gima-navy/40 hover:shadow-card transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-gima-navy transition-colors">
                    {qc.title}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {qc.tag}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  {qc.desc}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gima-navy group-hover:translate-x-0.5 transition-transform">
                <span>Start creative</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured GIMA Clinical Foundation */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Authoritative GIMA Knowledge</h3>
            <p className="text-xs text-slate-500">Directly accessible curriculum and research documents</p>
          </div>
          <Link href="/knowledge" className="text-xs font-semibold text-gima-navy hover:underline">
            View All 39 Records
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* ROHP Feature Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  FLAGSHIP PROGRAM
                </span>
                <span className="text-[11px] text-slate-400">ROHP / RNCP</span>
              </div>
              <h4 className="mt-2 text-sm font-bold text-slate-900">
                Advanced Nutritional Medicine and Sports Nutrition Specialist
              </h4>
              <p className="mt-1.5 text-xs text-slate-600 line-clamp-3">
                Qualifying curriculum for Registered Orthomolecular Health Practitioner. Comprises 6 rigorous didactic modules plus Module 7 clinical case study assignment.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">6 Core Courses + Mod 7</span>
              <Link href="/create?course=ROHP Certification" className="font-semibold text-gima-navy hover:underline">
                Promote Program &rarr;
              </Link>
            </div>
          </div>

          {/* Theories of Aging PDF Collection */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-5 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  FREE COURSE COLLECTION
                </span>
                <span className="text-[11px] text-amber-800 font-medium">12 PDFs</span>
              </div>
              <h4 className="mt-2 text-sm font-bold text-slate-900">
                Theories of Aging — Free Online Course
              </h4>
              <p className="mt-1.5 text-xs text-slate-600 line-clamp-3">
                Authoritative lecture slides & clinical reviews on Glutathione, Free Radicals, Telomeres, Melatonin, L-Carnitine, and Heavy Metal Chelation authored by Dr. James Meschino.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-200/50 flex items-center justify-between text-xs">
              <span className="text-amber-800 font-medium">Author: Dr. Meschino</span>
              <Link href="/create?course=Theories of Aging" className="font-semibold text-gima-navy hover:underline">
                Create Poster &rarr;
              </Link>
            </div>
          </div>

          {/* Brain Development Course */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                  FREE COURSE
                </span>
                <span className="text-[11px] text-slate-400">Neurology</span>
              </div>
              <h4 className="mt-2 text-sm font-bold text-slate-900">
                Nutritional Medicine in Brain Development
              </h4>
              <p className="mt-1.5 text-xs text-slate-600 line-clamp-3">
                Focusing on essential fatty acids, prenatal choline, neurotransmitter precursors, and neurological protection across pediatric and adult development.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Live Website Source</span>
              <Link href="/create?course=Nutritional Medicine in Brain Development" className="font-semibold text-gima-navy hover:underline">
                Create Campaign &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Lower Section: Recent Projects & Operational Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Projects</h3>
              <p className="text-[11px] text-slate-500">Saved promotional campaigns and generated previews</p>
            </div>
            <Link href="/projects" className="text-xs font-semibold text-gima-navy hover:underline">
              View All ({projects.length})
            </Link>
          </div>

          {projects.length > 0 ? (
            <div className="space-y-3 flex-1">
              {projects.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="h-11 w-11 rounded object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-500">{p.course} • {p.format}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 p-6 text-center">
              <FolderKanban className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-800">No projects saved yet</p>
              <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                Generate your first promotional poster or social campaign using the Create studio to view it here.
              </p>
              <Link
                href="/create"
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-gima-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-gima-navy-light transition-colors"
              >
                <Sparkles className="h-3 w-3 text-gima-gold-light" />
                <span>Create First Creative</span>
              </Link>
            </div>
          )}
        </div>

        {/* Operational Timeline */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-subtle flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Operational Log</h3>
              <p className="text-[11px] text-slate-500">Real system pipeline events and content ingestion</p>
            </div>
            <Link href="/activity" className="text-xs font-semibold text-gima-navy hover:underline">
              Full Activity
            </Link>
          </div>

          <div className="space-y-3.5 flex-1">
            {activities.slice(0, 3).map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-gima-navy">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{act.title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{act.description}</p>
                  <span className="text-[10px] text-slate-400 mt-0.5 inline-block">
                    {new Date(act.timestamp).toLocaleDateString()}
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
