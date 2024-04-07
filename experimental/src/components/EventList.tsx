import {useEffect, useState} from "react";
import axios from "axios";
import {Heading, HStack, Image, Stack, Text} from "@chakra-ui/react";


const CompetitionDisplay = ({competition}: { competition: any }) => {
    // console.log("Competition: ", competition);
    const competitorOne = competition.competitors.find((c: any) => c.order === 1);
    const competitorTwo = competition.competitors.find((c: any) => c.order === 2);
    console.log("Competition: ", competition.id);
    console.log("Competition: ", competition);
    console.log("CompetitorOne: ", competitorOne.athlete);
    console.log("CompetitorTwo: ", competitorTwo.athlete);
    const hasWinner = competition.status.type.state === "post";
    return (
        <HStack justifyContent={"space-between"}>
            <HStack width={300} justifyContent={"flex-start"}>
                <Image width={"100px"} src={competitorOne.athlete?.headshot?.href} />
                <Text color={hasWinner ? competitorOne.winner ? "green" : "red" : "black"}>{competitorOne.athlete?.fullName}</Text>
            </HStack>
            <Stack textAlign={"center"}>
                <Text fontWeight={800} color={"gray.600"} fontSize={12}>VS</Text>
                {hasWinner && (<Text fontSize={12}>{competition.status.result.displayName}{competition.status.result?.description ? `- ${competition.status.result?.description}` : ""}</Text>)}
            </Stack>
            <HStack width={300} justifyContent={"flex-end"}>
                <Text color={hasWinner ? competitorTwo.winner ? "green" : "red" : "black"}>{competitorTwo.athlete?.fullName}</Text>
                <Image  width={"100px"} src={competitorTwo.athlete?.headshot?.href} />
            </HStack>
        </HStack>
    )
}
const CompetitionComponent = ({competition, eventId}: { competition: any; eventId: string; }) => {
    const [competitionData, setCompetitionData] = useState<null | any>(null);
    useEffect(() => {
        // Function to fetch data
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/events/${eventId}/competitions/${competition.id}`);
                setCompetitionData(response.data.data); // Set data in state
            } catch (error) {
                console.error('There was an error fetching the data', error);
                // Optionally handle errors, e.g., updating the UI accordingly
            }
        };

        fetchData(); // Fetch data immediately upon mounting

        // Set up the interval for polling
        // const intervalId = setInterval(fetchData, 5000); // 5000 ms = 5 seconds
        //
        // Clean up interval on component unmount
        // return () => clearInterval(intervalId);
        return;
    }, [])

    return (
        <>
            {competitionData && (
                <CompetitionDisplay competition={competitionData}/>
            )}
        </>
    )
}
const EventComponent = ({event, active = false}: { event: any; active?: boolean }) => {
    const eventId = event.event.$ref.split("/").pop().split("?").shift();
    const [eventDetail, setEventDetail] = useState<null | any>(null);
    useEffect(() => {

        async function fetchEventDetail() {
            return axios.get(`http://localhost:3000/events/${eventId}`);
        }

        if (active) {
            fetchEventDetail().then((result) => {
                setEventDetail(result.data.event);
            })
        }

    }, [])
    if (active && eventDetail != null) {
        const competitionSegments = eventDetail.competitions.reduce((acc: any, elem: any) => {
            if (!(elem.cardSegment.name in acc)) {
                acc[elem.cardSegment.name] = [elem]
            } else {
                acc[elem.cardSegment.name].push(elem);
            }
            return acc
        }, {});
        console.log("Competition Segments: ", competitionSegments);
        return (
            <Stack>
                <Text as={"b"}>{eventDetail.name}</Text>
                <Stack>
                    {Object.entries(competitionSegments).map(([segment, competitions]: [string, any]) => (
                        <Stack>
                            <Text as={"b"} fontSize={12}>{segment}</Text>
                            <Stack gap={"20px"}>
                                {competitions.map((competition: any) => (
                                    <CompetitionComponent eventId={eventId} competition={competition}/>
                                ))}
                            </Stack>
                        </Stack>
                    ))}
                </Stack>
            </Stack>
        )
    }
    return (
        <div>{event.label}</div>
    )
}
export const EventList = () => {
    const [events, setEvents] = useState({
        activeEvent: null,
        pastEvents: [],
        futureEvents: [],
    });

    useEffect(() => {
        async function fetchEvents() {
            return axios.get("http://localhost:3000/events/");
        }

        fetchEvents().then((result) => {
            const {activeEvent, pastEvents, futureEvents} = result.data;
            setEvents({activeEvent, pastEvents, futureEvents});
        });
    }, []);
    return (
        <div>
            <Heading as={"h2"} size={"md"}>Events</Heading>
            <Stack>
                {events.activeEvent && (
                    <Stack>
                        <Text fontSize={12} color={"gray.600"} fontWeight={600}>Active Event</Text>
                        <EventComponent event={events.activeEvent} active={true}/>
                    </Stack>
                )}
                {events.futureEvents.length > 0 && (
                    <Stack>
                        <Text fontSize={12} color={"gray.600"} fontWeight={600}>Future Events</Text>
                        <Stack>
                            {events.futureEvents.map((event: any) => (<EventComponent event={event}/>))}
                        </Stack>
                    </Stack>
                )}
                {events.pastEvents.length > 0 && (
                    <Stack>
                        <Text fontSize={12} color={"gray.600"} fontWeight={600}>Past Events</Text>
                        <Stack>
                            {events.pastEvents.map((event: any) => (<EventComponent event={event}/>))}
                        </Stack>
                    </Stack>
                )}

            </Stack>
        </div>
    )
}
