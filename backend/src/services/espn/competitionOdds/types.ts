type ProviderRef = {
    $ref: string;
    id: string;
    name: string;
    priority: number;
};

type MoneyLine = {
    value: number;
    displayValue: string;
    alternateDisplayValue: string;
    decimal: number;
    fraction: string;
    american: string;
};

type AthleteOdds = {
    favorite: boolean;
    underdog: boolean;
    moneyLine: number;
    open?: {
        moneyLine: MoneyLine;
    };
    close?: {
        moneyLine: MoneyLine;
    };
    current?: {
        moneyLine: MoneyLine;
        pointSpread?: MoneyLine;
        spread?: MoneyLine;
    };
    spreadOdds?: number;
    athlete: {
        $ref: string;
    };
};

type OddsDetail = {
    $ref: string;
    provider: ProviderRef;
    details: string;
    overUnder?: number;
    overOdds?: number;
    underOdds?: number;
    spread?: number;
    awayAthleteOdds: AthleteOdds;
    homeAthleteOdds: AthleteOdds;
    links: Array<{
        language: string;
        rel: string[];
        href: string;
        text: string;
        shortText: string;
        isExternal: boolean;
        isPremium: boolean;
    }>;
    moneylineWinner: boolean;
    spreadWinner: boolean;
    open?: {
        total?: MoneyLine;
        over?: MoneyLine;
        under?: MoneyLine;
    };
    close?: {
        total?: MoneyLine;
        over?: MoneyLine;
        under?: MoneyLine;
    };
    current?: {
        total?: MoneyLine;
        over?: MoneyLine;
        under?: MoneyLine;
    };
};

export type CompetitionOdds = {
    count: number;
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    items: OddsDetail[];
};
