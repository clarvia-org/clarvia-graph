export type VerificationStatus =
  | "discovered"
  | "structured-from-source"
  | "source-checked"
  | "expert-reviewed"
  | "published"
  | "stale-review"
  | "superseded";

export type PublicationStatus =
  | "draft"
  | "review"
  | "published"
  | "withheld"
  | "archived";

export type Jurisdiction = {
  country: string;
  region: string | null;
  municipality: string | null;
};

export type Source = {
  id: string;
  object_type: "Source";
  title: string;
  source_type: string;
  url: string;
  jurisdiction: Jurisdiction;
  languages: string[];
  institution_ids: string[];
  accessed_at: string;
  last_verified_at: string | null;
  evidence_locator: string | null;
  reuse_notes: string | null;
  verification_status: VerificationStatus;
  notes: string | null;
};

export type Institution = {
  id: string;
  object_type: "Institution";
  name: string;
  jurisdiction: Jurisdiction;
  function: string;
  official_site: string;
  languages: string[];
  source_ids: string[];
  verification_status: VerificationStatus;
};

export type Deadline = {
  id: string;
  object_type: "Deadline";
  label: string;
  jurisdiction: Jurisdiction;
  trigger: string;
  text: string;
  source_ids: string[];
  verification_status: VerificationStatus;
};

export type Task = {
  id: string;
  object_type: "Task";
  title: string;
  summary: string | null;
  jurisdiction: Jurisdiction;
  phase: string;
  action_verb: string;
  source_ids: string[];
  verification_status: VerificationStatus;
  publication_status: PublicationStatus;
  user_actions: string[];
};

export type Workflow = {
  id: string;
  object_type: "Workflow";
  title: string;
  description: string | null;
  jurisdiction: Jurisdiction;
  workflow_type: string;
  task_ids: string[];
  source_ids: string[];
  verification_status: VerificationStatus;
  publication_status: PublicationStatus;
};

export type Scenario = {
  id: string;
  object_type: "Scenario";
  title: string;
  description: string | null;
  scenario_type: string;
  countries: string[];
  workflow_ids: string[];
  source_ids: string[];
  verification_status: VerificationStatus;
  publication_status: PublicationStatus;
};
