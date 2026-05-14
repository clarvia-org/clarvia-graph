import type { Source, Task, Workflow } from "@/lib/workflow-types";

export const sampleSources: Source[] = [
  {
    id: "source:lu:guichet:death-life-event",
    object_type: "Source",
    title: "Death of a close relative",
    source_type: "government_portal",
    url: "https://guichet.public.lu/en/citoyens/life-event/famille-education/deces-proche.html",
    jurisdiction: {
      country: "LU",
      region: null,
      municipality: null
    },
    languages: ["en"],
    institution_ids: ["institution:lu:guichet"],
    accessed_at: "2026-05-14",
    last_verified_at: null,
    evidence_locator: null,
    reuse_notes:
      "Official Luxembourg public-service portal source. Extract only source-backed administrative facts.",
    verification_status: "discovered",
    notes: "Initial seed source. Requires source-checking before publication."
  }
];

export const sampleTasks: Task[] = [
  {
    id: "task:lu:death-declaration",
    object_type: "Task",
    title: "Declare the death",
    summary:
      "Administrative task for declaring a death to the relevant Luxembourg authority. Details require source-checking before publication.",
    jurisdiction: {
      country: "LU",
      region: null,
      municipality: null
    },
    phase: "registration",
    action_verb: "declare",
    source_ids: ["source:lu:guichet:death-life-event"],
    verification_status: "discovered",
    publication_status: "draft",
    user_actions: [
      "Check the official source for the responsible authority and required documents.",
      "Do not treat this alpha item as complete or reviewed."
    ]
  }
];

export const sampleWorkflow: Workflow = {
  id: "workflow:lu:luxembourg-alpha",
  object_type: "Workflow",
  title: "Luxembourg bereavement administration alpha workflow",
  description:
    "Initial source-backed Luxembourg workflow draft. Not complete and not yet published.",
  jurisdiction: {
    country: "LU",
    region: null,
    municipality: null
  },
  workflow_type: "national_core",
  task_ids: ["task:lu:death-declaration"],
  source_ids: ["source:lu:guichet:death-life-event"],
  verification_status: "discovered",
  publication_status: "draft"
};
