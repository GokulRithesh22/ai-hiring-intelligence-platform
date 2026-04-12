"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CreateJobForm() {
  const router = useRouter();
  const [roleTitle, setRoleTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [experienceRange, setExperienceRange] = useState("");
  const [skills, setSkills] = useState("");
  const [roleType, setRoleType] = useState("");
  const [priority, setPriority] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const search = new URLSearchParams({
      roleTitle,
      department,
      experienceRange,
      skills,
      roleType,
      priority
    });
    router.push(`/jd-variants?${search.toString()}`);
  };

  return (
    <form className="wf-stack-lg" onSubmit={handleSubmit}>
      <div>
        <label className="wf-label" htmlFor="role-title">
          Role Title
        </label>
        <input
          className="wf-input"
          id="role-title"
          value={roleTitle}
          onChange={(event) => setRoleTitle(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="wf-label" htmlFor="department">
          Department
        </label>
        <input
          className="wf-input"
          id="department"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="wf-label" htmlFor="experience-range">
          Experience Range
        </label>
        <input
          className="wf-input"
          id="experience-range"
          value={experienceRange}
          onChange={(event) => setExperienceRange(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="wf-label" htmlFor="skills">
          Skills
        </label>
        <input
          className="wf-input"
          id="skills"
          value={skills}
          onChange={(event) => setSkills(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="wf-label" htmlFor="role-type">
          Role Type
        </label>
        <input
          className="wf-input"
          id="role-type"
          value={roleType}
          onChange={(event) => setRoleType(event.target.value)}
          required
        />
      </div>

      <div>
        <label className="wf-label" htmlFor="priority">
          Priority
        </label>
        <input
          className="wf-input"
          id="priority"
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          required
        />
      </div>

      <button className="wf-button" type="submit">
        Generate JD
      </button>
    </form>
  );
}
