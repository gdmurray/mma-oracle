import {Router} from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {prisma} from "../services/prisma";
import {getPromotionClass} from "../services/promotion/promotions";

dayjs.extend(utc);
const promotionRouter = Router();

promotionRouter.get("/:promotionId/events", async (req, res) => {
    const {promotionId} = req.params;
    // Fetch Promotion Record
    const promotion = await prisma.promotion.findUnique({
        where: {slug: promotionId},
        include: {events: true},
    })
    if (promotion == null) {
        console.error(`Promotion Not Found: ${promotionId}`);
        res.status(404).send("Not Found");
        return;
    }

    // Fetch Promotion Class
    const Promotion = getPromotionClass(promotionId);
    if (Promotion == null) {
        res.status(404).send("Not Found");
        return;
    }
    const promotionClass = new Promotion(promotionId);

    const events = await promotionClass.getUpcomingPromotionEvents();


    const eventMap = promotion.events.reduce<{ [key: string]: any }>((acc, elem) => {
        acc[elem.internalId as string] = elem;
        return acc;
    }, {});

    for (const event of events) {
        if (eventMap[event.id]) {
            const currentEvent = eventMap[event.id];
            const diffKeys = {name: "title", date: "date"}
            const diffObject: { [key: string]: any } = {}
            for (const key of Object.keys(diffKeys)) {
                const prismaKey = diffKeys[key as keyof typeof diffKeys];
                console.log("Key Compare: ", currentEvent[prismaKey], event[key as keyof typeof event]);
                if (currentEvent[prismaKey] !== event[key as keyof typeof event]) {
                    diffObject[prismaKey as string] = event[key as keyof typeof event];
                }
            }
            if (Object.keys(diffObject).length > 0) {
                console.log("Updated Event: ", diffObject);
                // await prisma.event.update({
                //     where: {internalId: event.id},
                //     data: {
                //         ...diffObject,
                //     }
                // })
            }
            // await prisma.event.update({
            //     where: {id: event.id},
            //     data: event
            // })
        } else {
            console.log("Creating Event");
            await prisma.event.create({
                data: {
                    title: event.name,
                    date: event.date,
                    promotion: {connect: {slug: promotionId}}
                }
            })
        }
    }

    res.status(200).send("OK");
})

export default promotionRouter;
