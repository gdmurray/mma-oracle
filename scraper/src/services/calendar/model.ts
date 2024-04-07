// import {Schema, model, InferSchemaType} from "mongoose";
import {Schema, model} from "mongoose";


const calendarEventDataSchema = new Schema({
    label: {type: String, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    event: {
        $ref: {
            type: String, required: true
        }
    }
});

export const calendarEventsSchema = new Schema({
    data: [calendarEventDataSchema],
    lastFetched: {type: Date, required: true}
})

// export type CalendarEventsSchema = InferSchemaType<typeof calendarEventsSchema>;

export const CalendarEventModel = model('CalendarEvent', calendarEventsSchema)
