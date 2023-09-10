import {
  InteractionType
} from 'discord-interactions';

export interface DropdownProps {
  title: string
}

export interface TableProps {
  title: string,
  scores: PlayerScore[] | null,
}

export interface ScoreTally {
  [index: string]: number
}

export interface PlayerScore {
  name: string,
  score: number
}

export interface CompetitionParticipation {
  player: {
    displayName: string
  },
  progress: {
    gained: number
  }
}

export interface GetCompetitionDetailsResponse {
  participations: CompetitionParticipation[]
}

export interface DiscordWebookDataOptions {
  name: "name" | "points_multiplier" | "wom_id",
  value: string | number
}

export interface DiscordWebhookData {
  type: InteractionType,
  token: string,
  data: {
    name: "setup" | "add" | "deploy",
    options: DiscordWebookDataOptions[]
  }
}

export interface AsyncWebhookData {
  token: string
}

export interface DiscordWebhookUpdateBody {
  content: string
}

export interface VercelDeployCompBody {
  name: string
  deploymentId: string
  target: string
}

export interface VercelEnvVar {
  key: string,
  id: string
}

export interface VercelSetEnvVarBody {
  key: string
  value: string
  target: string[]
  type: string
}

export type VercelApiBody = VercelDeployCompBody | VercelSetEnvVarBody
