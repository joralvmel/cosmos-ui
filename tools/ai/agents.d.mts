export interface AgentInfo {
  name: string;
  description: string;
  skills: string[];
}

export interface SkillInfo {
  name: string;
  description: string;
  agent: string;
}

export declare function listAgents(root: string): AgentInfo[];
export declare function listSkills(root: string): SkillInfo[];
export declare function agentsMarkdown(root: string): string;
export declare function skillsMarkdown(root: string): string;
