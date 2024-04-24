export interface CompetitionStatus {
    $ref: string;
    clock: number;
    displayClock: string;
    period: number;
    type: CompetitionStatusType;
    result: CompetitionResult;
    featured: boolean;
}

interface CompetitionStatusType {
    id: string;
    name: string;
    state: string;
    completed: boolean;
    description: string;
    detail: string;
    shortDetail: string;
}

interface CompetitionResult {
    id: number;
    name: string;
    displayName: string;
    description?: string; // Optional based on presence in some JSON files
    displayDescription?: string; // Optional based on presence in some JSON files
    shortDisplayName: string;
    target?: Target; // Optional based on presence in some JSON files
}

interface Target {
    id: number;
    name: string;
    description: string;
    displayDescription: string;
}
