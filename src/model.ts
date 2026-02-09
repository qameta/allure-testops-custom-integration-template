export interface ExtServerInfo {
  name: string;
}

export interface ExtUser {
  id: string;
  name: string;
}

export interface ExtJobParameter {
  name: string;
  value: string;
}

export interface ExtJob {
  name: string;
  url: string;
  externalId: string;
  parameters: ExtJobParameter[];
}

export enum ExtJobRunStage {
  RUN_FAILURE = "RUN_FAILURE",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

export enum ExtJobRunStatus {
  CANCELLED = "CANCELLED",
  PASSED = "PASSED",
  FAILED = "FAILED",
  UNKNOWN = "UNKNOWN",
}

export interface ExtJobRun {
  stage: ExtJobRunStage;
  status: ExtJobRunStatus;
  id: string;
  name: string;
  url: string;
}

export interface ExtTestCaseRunRequest {
  id: number;
  selector: string;
}

export interface ExtJobStartRequest {
  jobRunId: number;
  launchId: number;
  tests: ExtTestCaseRunRequest[];
  parameters: Record<string, string>;
  username: string;
}

export interface ExtIssueLink {
  url: string;
  key: string;
  summary: string;
  status: string;
  closed: boolean;
}

export interface ExtProject {
  id: string;
  key: string;
  name: string;
}

export interface ExtIssueType {
  id: string;
  name: string;
}

export interface ExtIssueCreate {
  [key: string]: unknown;
}

export interface ExtTestLink {
  url: string;
  key: string;
  summary: string;
}
