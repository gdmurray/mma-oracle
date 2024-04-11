import {readFile} from "node:fs/promises"
import neatCsv from "neat-csv";
import {getRanking, Rank, RankDistributions} from "./ranks";
import {americanToDecimal} from "../routes/model/utils";

const PLAYER_COUNT = 250;
const FIGHT_COUNT = 6;
const EVENT_COUNT = 36;


export type Event = {
    player: number;
    method: "Decision" | "TKO" | "Submission";
    round: number | null;
}

async function loadCSV(): Promise<{ data: any; fighters: string[] }> {
    const csvData = await readFile("./data/training-data.csv", "utf-8");
    const data = await neatCsv(csvData);
    const fighterSet = new Set<string>();
    for (const row of data) {
        fighterSet.add([row["Fighter One"], row["Fighter Two"]].join(","));
    }
    return {data, fighters: Array.from(fighterSet)};
}

function getRandomOutcome() {
    const frequencies = [
        {
            method: "TKO",
            round: 1,
            frequency: 0.20261437908496732,
        }, {
            method: "TKO",
            round: 2,
            frequency: 0.10457516339869281,
        }, {
            method: "TKO",
            round: 3,
            frequency: 0.03594771241830065,
        },
        {
            method: "Submission",
            round: 1,
            frequency: 0.08169934640522876,
        }, {
            method: "Submission",
            round: 2,
            frequency: 0.08169934640522876,
        }, {
            method: "Submission",
            round: 3,
            frequency: 0.0392156862745098,
        },
        {
            method: "Decision",
            round: null,
            frequency: 0.4542483660130719,
        },
    ]

    const randomNum = Math.random();
    let accumulated = 0;
    for (const outcome of frequencies) {
        accumulated += outcome.frequency;
        if (randomNum < accumulated) {
            return {method: outcome.method, round: outcome.round};
        }
    }
}

function calculateRankingPoints(percentile: number, player: Player): number {
    // Convert the player's percentile to match the distribution mappings
    const adjustedPercentile = 100 - percentile;
    const distributions = RankDistributions[player.rank];

    // Find the correct points for the player's percentile
    for (const [lowerBound, points] of Object.entries(distributions).sort((a, b) => parseInt(b[0]) - parseInt(a[0]))) {
        if (adjustedPercentile >= parseInt(lowerBound)) {
            // Directly return the points without accumulation
            return points;
        }
    }

    // Fallback: In case no match is found (should not happen if distributions are comprehensive)
    return 0;
}

function getRandomMultipliers(rows: any[], fighters: string[]) {
    let randomIndex = getRandomIntInRange(0, fighters.length - 1);
    let randomFighter = fighters[randomIndex];
    const [fighterOne, fighterTwo] = randomFighter.split(",");
    const fighterRows = rows.filter(row => {
        if ((row["Fighter One"] === fighterOne && row["Fighter Two"] === fighterTwo) || (row["Fighter One"] === fighterTwo && row["Fighter Two"] === fighterOne)) {
            return row;
        }
    }).slice(0, 6);
    const fighterOneByTKO = fighterRows.find(row => row["Label"] === "FighterOneByTKO");
    const fighterOneBySubmission = fighterRows.find(row => row["Label"] === "FighterOneBySubmission");
    const fighterOneByDecision = fighterRows.find(row => row["Label"] === "FighterOneByDecision");

    const fighterTwoByTKO = rows.find(row => row["Label"] === "FighterTwoByTKO");
    const fighterTwoBySubmission = rows.find(row => row["Label"] === "FighterTwoBySubmission");
    const fighterTwoByDecision = rows.find(row => row["Label"] === "FighterTwoByDecision");

    return {
        fighterOne: {
            moneyLine: americanToDecimal(fighterOneByTKO["F1 ML"]) as number,
            tko: fighterOneByTKO["Odds Dec"],
            submission: fighterOneBySubmission["Odds Dec"],
            decision: fighterOneByDecision["Odds Dec"],
        },
        fighterTwo: {
            moneyLine: americanToDecimal(fighterTwoByTKO["F1 ML"]) as number,
            tko: fighterTwoByTKO["Odds Dec"],
            submission: fighterTwoBySubmission["Odds Dec"],
            decision: fighterTwoByDecision["Odds Dec"],
        },
    }
}


type Player = {
    id: number;
    rank: Rank;
    points: number;
    events: { points: number; percentile: number }[];

}

// function getRandomInteger(max: number){
//     // This results in an integer in the range [0, max - 1].
//     return Math.floor(Math.random() * max);
// }

function getRandomIntInRange(min: number, max: number): number {
    // Ensure the min and max are integers
    const minimum = Math.ceil(min);
    const maximum = Math.floor(max);

    // Math.random() gives a random number in the range [0, 1).
    // Multiplying by (maximum - minimum + 1) makes the range [0, (max - min + 1)).
    // Adding minimum shifts the range to [min, max + 1), making max inclusive.
    // Finally, Math.floor() is used to round down to the nearest whole number.
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

const picks = [
    {
        outcome: "TKO",
        round: 1,
    }, {
        outcome: "TKO",
        round: 2,
    }, {
        outcome: "TKO",
        round: 3,
    },
    {
        outcome: "Submission",
        round: 1,
    }, {
        outcome: "Submission",
        round: 2,
    }, {
        outcome: "Submission",
        round: 3,
    },
    {
        outcome: "Decision",
        round: null,
    },
]

type Pick = {
    method: string;
    round: number | null;
    winner: 0 | 1;
    isDoubleDown: boolean;
    xp: number;
}

function calculatePercentile(userScore: number, scores: number[]): number {
    const totalPlayers = scores.length;
    const betterScores = scores.filter(score => score < userScore).length;
    return Math.round((betterScores / totalPlayers) * 100);
}

function distributeXP(): number[] {
    const numPicks = 6;
    const totalXP = 1000;
    const minXPPerPick = 100;
    const maxXPPerPick = 300; // Set a maximum XP per pick to ensure more uniform distribution
    const interval = 50;
    const xpArray = new Array(numPicks).fill(minXPPerPick); // Start each pick with minimum XP
    let remainingXP = totalXP - minXPPerPick * numPicks; // Calculate remaining XP after minimum distribution

    while (remainingXP > 0) {
        let distributedThisRound = 0;

        for (let i = 0; i < numPicks && remainingXP > 0; i++) {
            // Determine the maximum additional XP that can be added to this pick
            const maxAdditionalXP = Math.min(maxXPPerPick - xpArray[i], remainingXP);
            if (maxAdditionalXP <= 0) continue; // Skip if we can't add more XP to this pick

            // Randomly decide the additional XP for this pick, ensuring it's a multiple of the interval and does not exceed maxAdditionalXP
            const additionalXP = Math.floor(Math.random() * (maxAdditionalXP / interval + 1)) * interval;

            // Update XP for the current pick and adjust remaining XP
            xpArray[i] += additionalXP;
            remainingXP -= additionalXP;
            distributedThisRound += additionalXP;
        }

        // If no XP was distributed in this round, it means we cannot distribute further without exceeding max per pick
        if (distributedThisRound === 0) break;
    }

    return xpArray;
}

function predictOutcome(actualOutcome: 0 | 1): 0 | 1 {
    // Updated array of probabilities
    const probabilities = [0.9, 1.5];
    // Randomly select a probability
    const selectedProbability = probabilities[Math.floor(Math.random() * probabilities.length)];
    // Generate a random number between 0 and 1
    const randomNumber = Math.random();

    // Determine if the prediction matches the actual outcome based on the selected probability
    const isPredictionCorrect = randomNumber <= selectedProbability;

    // If the prediction is deemed correct according to the probability, return the actual outcome; otherwise, return the opposite
    return isPredictionCorrect ? actualOutcome : (actualOutcome === 0 ? 1 : 0);
}

export async function simulateRanks() {
    // console.log(PLAYER_COUNT, FIGHT_COUNT, EVENT_COUNT)

    // Generate 100 Players
    const players: Player[] = Array.from({length: PLAYER_COUNT}, (_, index) => {
        return {
            id: index,
            rank: Rank.BACKYARD,
            points: 0,
            events: Array.from({length: EVENT_COUNT}, () => {
                return {
                    points: 0,
                    percentile: 0,
                }
            })
        }
    });

    // console.log(`Generated ${players.length} players`);

    const {data, fighters} = await loadCSV();
    for (let eventIndex = 0; eventIndex < EVENT_COUNT; eventIndex++) {
        // Generate Odds and winner of 6 competitions
        const competitions = Array.from({length: 6}, () => {
            const multipliers = getRandomMultipliers(data, fighters);
            const winner = getRandomIntInRange(0, 1);
            return {
                multipliers: multipliers,
                winner: winner,
                outcome: getRandomOutcome()
            }
        });

        // competitions.forEach((competition, index) => {
        //     console.log(`Competition ${index}: `, competition);
        // })

        // Generate Picks for each player, and whether they doubled down
        const fightPicks = Array.from({length: PLAYER_COUNT}, () => {
            const isDoubleDown = getRandomIntInRange(0, 5);
            const playerPicks: Pick[] = [];
            const xpDist = distributeXP();
            for (let fightIndex = 0; fightIndex < 6; fightIndex++) {
                const randomFightPick = picks[getRandomIntInRange(0, 6)];
                const fightWinner = predictOutcome(competitions[fightIndex].winner as 0 | 1);
                playerPicks.push({
                    method: randomFightPick.outcome,
                    round: randomFightPick.round,
                    winner: fightWinner as 0 | 1,
                    isDoubleDown: fightIndex === isDoubleDown,
                    xp: xpDist[fightIndex],
                })
            }
            return playerPicks;
        });

        // fightPicks.forEach((picks, index) => {
        //     console.log(`Player ${index} Fight Picks`)
        //     picks.forEach((pick, pickIndex) => {
        //         console.log(`Pick ${pickIndex}: `, pick);
        //     })
        //     console.log("\n-------------\n")
        // })

        // Calculate points for each player
        const points = Array.from({length: PLAYER_COUNT}, () => {
            return Array.from({length: FIGHT_COUNT}, () => 0);
        });

        for (let playerIndex = 0; playerIndex < PLAYER_COUNT; playerIndex++) {
            // const player = players[playerIndex];
            const playerPicks = fightPicks[playerIndex];
            for (let fightIndex = 0; fightIndex < FIGHT_COUNT; fightIndex++) {
                const pick = playerPicks[fightIndex];
                const {multipliers, winner, outcome} = competitions[fightIndex];
                // console.log("Pick vs Winner: ", pick.winner, winner);
                if (pick.winner === winner) {
                    const key = winner === 0 ? "fighterOne" : "fighterTwo";
                    const winnerMultipliers = multipliers[key];
                    const winnerXp = pick.xp * winnerMultipliers.moneyLine;
                    // console.log("Winner Xp, ", pick.xp, winnerMultipliers.moneyLine, winnerXp);
                    const methodXp = pick.xp * winnerMultipliers[pick.method.toLowerCase() as keyof typeof winnerMultipliers];
                    // console.log("Method Xp, ", pick.xp, winnerMultipliers[pick.method.toLowerCase() as keyof typeof winnerMultipliers], methodXp);
                    const roundXp = 100;

                    // Is Double down... All have to hit...
                    if (pick.isDoubleDown) {
                        if (pick.method === outcome.method && pick.round === outcome.round) {
                            const totalXp = (winnerXp + methodXp + roundXp) * 2;
                            points[playerIndex][fightIndex] += totalXp;
                        }
                    } else {
                        if (pick.method === outcome.method) {
                            points[playerIndex][fightIndex] += winnerXp;
                        }

                        if (pick.round === outcome.round) {
                            points[playerIndex][fightIndex] += roundXp;
                        }
                    }
                }
            }
        }
        //
        points.forEach((point, index) => {
            const sum = point.reduce((a, b) => a + b, 0);
            console.log(`Player ${index} XP: ${point.map(elem => Math.round(elem))}xp = ${Math.round(sum)}xp`);
        })

        // Print Sorted points
        const sumPoints = points.map((point, index) => {
            return {id: index, points: Math.round(point.reduce((a, b) => a + b, 0))}
        })

        for (let playerIndex = 0; playerIndex < PLAYER_COUNT; playerIndex++) {
            players[playerIndex].events[eventIndex].points = sumPoints[playerIndex].points;
            players[playerIndex].events[eventIndex].percentile = calculatePercentile(sumPoints[playerIndex].points, sumPoints.map(point => point.points));
        }

        for (let playerIndex = 0; playerIndex < PLAYER_COUNT; playerIndex++) {
            const rankingPoints = calculateRankingPoints(players[playerIndex].events[eventIndex].percentile, players[playerIndex]);
            // console.log("Adding Ranking Points:", rankingPoints, players[playerIndex].events[eventIndex].percentile);
            players[playerIndex].points += rankingPoints;
            const playerRanking = getRanking(players[playerIndex].points, players[playerIndex].rank);
            if (playerRanking !== players[playerIndex].rank) {
                players[playerIndex].rank = playerRanking;
            }
        }
        // players.forEach((player) => {
        //     console.log(`Player ${player.id} Event ${eventIndex}: ${player.events[eventIndex].points}xp, ${player.events[eventIndex].percentile}%`);
        // })
        const rankMap = players.reduce<{[key: string]: number}>((acc, player) => {
            if (acc[getRankString(player.rank)]) {
                acc[getRankString(player.rank)]++;
            } else {
                acc[getRankString(player.rank)] = 1;
            }
            return acc;
        }, {})

        console.log(`Ranking Map after Event: ${eventIndex}: `, rankMap);
    }
}


function getRankString(value: number): string {
    switch (value) {
        case Rank.BACKYARD:
            return "BACKYARD";
        case Rank.CAGE:
            return "CAGE";
        case Rank.RANKED:
            return "RANKED";
        case Rank.CONTENDER:
            return "CONTENDER";
        case Rank.CHAMPION:
            return "CHAMPION";
        default:
            return "Unknown Rank";
    }
}
