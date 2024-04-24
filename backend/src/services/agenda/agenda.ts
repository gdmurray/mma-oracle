import Agenda from "agenda";
import {mongoUrl} from "../mongo";
import mongoose from "mongoose";
import {v4 as uuidv4} from "uuid"
export const agenda = new Agenda({db: {address: mongoUrl}});

const AgendaLock = mongoose.models["AgendaLock"]
    ||
    mongoose.model("AgendaLock", new mongoose.Schema({
        lockId: String,
        timestamp: Date,
        instanceId: String,
    }))

const instanceId = uuidv4();
let agendaStarted = false;
export async function startAgenda() {
    if(!agendaStarted){
        await agenda.start();
        console.log('Agenda started!');
        agendaStarted = true;
    }
}

export async function selectMasterAgendaNode() {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    const result = await AgendaLock.findOneAndUpdate(
        {
            lockId: "agenda_master", $or: [
                {timestamp: {$lt: tenMinutesAgo}},
                {instanceId: instanceId}
            ]
        },
        {timestamp: now, instanceId: instanceId},
        {new: true, upsert: true}
    )

    if (result.instanceId === instanceId) {
        console.log("This instance is the master");
        startAgenda().catch(error => console.error(error));
    } else {
        console.log("This node instance is not the agenda master...")
    }
}
