import {ServiceContext} from "../context";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {apiClient} from "../apiClient/apiClient";
import {EventService} from "../espn/event/service";

dayjs.extend(utc);

export class ESPNPromotion {
    public promotionSlug: string;
    public serviceContext: ServiceContext;

    constructor(slug: string, serviceContext?: ServiceContext) {
        this.promotionSlug = slug;
        this.serviceContext = serviceContext;
    }

    public async getUpcomingPromotionEvents() {
        const today = dayjs();
        const endDate = today.add(6, 'months');
        const queryString = `?dates=${today.format("YYYYMMDD")}-${endDate.format("YYYYMMDD")}&limit=100`;
        const response = await apiClient.fetch(`https://sports.core.api.espn.com/v2/sports/mma/leagues/${this.promotionSlug}/events${queryString}`);
        const eventsList = await response.json();
        const {items} = eventsList as { items: { $ref: string }[] };
        const filteredEvents = (await Promise.all(items.map((elem) => {
            const eventsService = new EventService(elem.$ref, this.serviceContext);
            return eventsService.get();
        })));

        return filteredEvents;
    }

    // public async getEventData(eventId: string){
    //
    // }
}
