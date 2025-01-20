export type Category =
  | 'claim'
  | 'reasoning'
  | 'evidence'
  | 'rebuttal'
  | 'others';

export type Sentence = {
  id: number;
  content: string;
  paragraph: number;
};

export type HowItem = {
  title: string;
  strategy: string;
};

export type GPTPlan = {
  sentence: string;
  what: number[];
  why: string;
  how: HowItem[];
};

export type HumanPlan = {
  sentence: string;
  what: number[];
  why: string | null;
  how: string | null;
};

export type FeedbackItem = {
  id: number;
  content: string;
  actionability: number;
  justification: number;
  sentiment: number;
  specificity: number;
  engagement: number;
  source: number;
  type: string;
  file: string;
  plan: GPTPlan[];
  addressed: boolean;
};

export type FeedbackSourceItem = {
  id: number;
  content: string;
  file: string;
};

export type DistributionItem = {
  [key: string]: number;
};

export type HumanPlanItem = {
  feedbackId: number;
  plan: HumanPlan[];
};

export type RevisionItem = {
  revision: string;
  better: boolean;
  explanation: string;
};

export type Revision = {
  id: number;
  sentence: string;
  revision: RevisionItem[];
};

export type GlobalHumanReflectionItem = {
  feedback: string | null;
  why: string | null;
  how: string | null;
};

export type GlobalHumanPlanItem = {
  id: number;
  sentence: string;
  reflection: GlobalHumanReflectionItem[];
};
