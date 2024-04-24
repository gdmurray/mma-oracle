export enum Rank {
    BACKYARD = 5,
    CAGE = 4,
    RANKED = 3,
    CONTENDER = 2,
    CHAMPION = 1,
}

export const rankOrders = [Rank.BACKYARD, Rank.CAGE, Rank.RANKED, Rank.CONTENDER, Rank.CHAMPION]


export const pointThresholds = {
    [Rank.BACKYARD]: 0,
    [Rank.CAGE]: 10,
    [Rank.RANKED]: 20,
    [Rank.CONTENDER]: 30,
    [Rank.CHAMPION]: 40,
}

export function getRanking(points: number, currentRank: Rank) {
    // Start at Cage. which is 10
    const rankIndex = rankOrders.indexOf(currentRank);
    for(let i = 1; i < rankOrders.length; i++){
        const rank = rankOrders[i];

        // If points EXCEEDS the current threshold
        if(points >= pointThresholds[rank] && rankIndex < i){
            if(points > 20){
                console.log("Points Exceeds Threshold: ", points, pointThresholds[rank]);
            }
            return rank;
        }
    }

    return currentRank;
}
export const RankDistributions = {
    [Rank.BACKYARD]: {
        76: 0,
        61: 1,
        46: 2,
        26: 3,
        11: 4,
        0: 5,
    },
    [Rank.CAGE]: {
        81: -2,
        61: -1,
        51: 0,
        41: 1,
        21: 2,
        6: 3,
        0: 4,
    },
    [Rank.RANKED]: {
        91: -3,
        71: -2,
        51: -1,
        41: 0,
        31: 1,
        21: 2,
        6: 3,
        0: 4,
    },
    [Rank.CONTENDER]: {
        91: -3,
        66: -2,
        41: -1,
        31: 0,
        23: 1,
        14: 2,
        6: 3,
        0: 4
    },
    [Rank.CHAMPION]: {
        91: -4,
        71: -3,
        51: -2,
        31: -1,
        21: 0,
        16: 1,
        11: 2,
        6: 3,
        0: 4,
    }
}
