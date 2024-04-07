import {InferSchemaType, Schema, model} from "mongoose";

const DraftKingsFighterOdds = new Schema({
    "byTKO": {type: Number, required: true},
    "byDecision": {type: Number, required: true},
    "bySubmission": {type: Number, required: true},
})

const DraftKingsCompetitionOddsData = new Schema({
    competitionId: {type: String, required: true},
    fighterOne: DraftKingsFighterOdds,
    fighterTwo: DraftKingsFighterOdds,
})


const DraftKingCompetitionOdds =  new Schema({
    data: DraftKingsCompetitionOddsData,
    lastFetched: {type: Date}
})

export type DraftKingsCompetitionOdds = InferSchemaType<typeof DraftKingsCompetitionOddsData>;
export const DraftKingsCompetitionOddsModel = model("DraftKingsCompetitionOdds", DraftKingCompetitionOdds);

