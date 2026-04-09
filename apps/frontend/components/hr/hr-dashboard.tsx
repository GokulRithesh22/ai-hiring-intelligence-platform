"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState, useTransition } from "react";
import { getHrDashboard } from "@/lib/api-adapters";
import type { DashboardFilters, HrDashboardData } from "@/lib/types";

type HrDashboardProps = {
  initialData: HrDashboardData;
};

const initialFilters: DashboardFilters = {
  resumeScoreMin: "",
  interviewScoreMin: "",
  joiningTimeline: "",
  salaryMax: "",
  relocation: "",
  status: ""
};

export function HrDashboard({ initialData }: HrDashboardProps) {
  const [filters, setFilters] = useState<DashboardFilters>(initialFilters);
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const deferredFilters = useDeferredValue(filters);

  useEffect(() => {
    startTransition(async () => {
      const nextData = await getHrDashboard(deferredFilters);
      setData(nextData);
    });
  }, [deferredFilters]);

  return (
    <div className="stack-lg">
      <section className="stats-grid">
        {data.stats.map((stat) => (
          <article className="card" key={stat.label}>
            <span className="subtle-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
            <span className="muted">{stat.change}</span>
          </article>
        ))}
      </section>

      <section className="filter-panel card stack-lg">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Candidate filters</span>
            <h2>Shortlist with structured constraints</h2>
          </div>
          <span className={`status-pill ${isPending ? "status-progress" : "status-approved"}`}>
            {isPending ? "Refreshing" : `${data.candidates.length} candidates`}
          </span>
        </div>

        <div className="filters-grid">
          <label className="filter">
            <span>Resume score</span>
            <input
              value={filters.resumeScoreMin}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  resumeScoreMin: event.target.value
                }))
              }
              placeholder="70"
            />
          </label>
          <label className="filter">
            <span>Interview score</span>
            <input
              value={filters.interviewScoreMin}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  interviewScoreMin: event.target.value
                }))
              }
              placeholder="75"
            />
          </label>
          <label className="filter">
            <span>Joining timeline</span>
            <select
              value={filters.joiningTimeline}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  joiningTimeline: event.target.value
                }))
              }
            >
              <option value="">Any</option>
              <option value="30 days">30 days</option>
              <option value="45 days">45 days</option>
              <option value="60 days">60 days</option>
            </select>
          </label>
          <label className="filter">
            <span>Salary expectation max</span>
            <input
              value={filters.salaryMax}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  salaryMax: event.target.value
                }))
              }
              placeholder="₹32L"
            />
          </label>
          <label className="filter">
            <span>Relocation</span>
            <select
              value={filters.relocation}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  relocation: event.target.value
                }))
              }
            >
              <option value="">Any</option>
              <option value="Open">Open</option>
              <option value="Not needed">Not needed</option>
              <option value="Declined">Declined</option>
            </select>
          </label>
          <label className="filter">
            <span>Application status</span>
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status: event.target.value
                }))
              }
            >
              <option value="">Any</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Screened out">Screened out</option>
              <option value="Pending HR review">Pending HR review</option>
            </select>
          </label>
        </div>
      </section>

      <section className="table-panel card stack">
        <div className="panel-heading">
          <div>
            <span className="subtle-label">Pipeline table</span>
            <h2>Review candidates across active roles</h2>
          </div>
          <Link className="button button-secondary" href="/candidates/cand-001">
            Open intelligence report
          </Link>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Resume Score</th>
                <th>Interview Score</th>
                <th>Joining Timeline</th>
                <th>Salary Expectation</th>
                <th>Relocation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>
                    <Link href={`/candidates/${candidate.id}`}>{candidate.name}</Link>
                  </td>
                  <td>{candidate.resumeScore}</td>
                  <td>{candidate.interviewScore}</td>
                  <td>{candidate.joiningTimeline}</td>
                  <td>{candidate.salaryExpectation}</td>
                  <td>{candidate.relocation}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        candidate.status === "Shortlisted"
                          ? "status-shortlisted"
                          : candidate.status === "Screened out"
                            ? "status-stop"
                            : candidate.status === "Pending HR review"
                              ? "status-pending"
                              : "status-progress"
                      }`}
                    >
                      {candidate.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
