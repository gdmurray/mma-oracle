export type AthleteStatistics = {
    $ref: string;
    athlete: {
        $ref: string;
    };
    splits: {
        id: string;
        name: string;
        abbreviation: string;
        type: string;
        categories: Category[];
    };
}

type Category = {
    name: string;
    displayName: string;
    shortDisplayName: string;
    abbreviation: string;
    summary?: string;
    stats: Stat[];
}

type Stat = {
    name: StatName;
    displayName: string;
    shortDisplayName: string;
    description: string;
    abbreviation: string;
    value: number;
    displayValue: string;
}

type StatName =
    'takedownAccuracy'
    | 'strikeLPM'
    | 'strikeAccuracy'
    | 'takedownAvg'
    | 'submissionAvg'
    | 'koPercentage'
    | 'tkoPercentage'
    | 'decisionPercentage';
