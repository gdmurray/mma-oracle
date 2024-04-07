const moduleMapper = {
    "AthleteService": "./athlete/service",
    "AthleteEventLogService": "./athleteEventLog/service",
    "AthleteStatisticsService": "./athleteStatistics/service",
    "CompetitionService": "./competition/service",
    "AthleteRecordsService": "./athleteRecords/service",
    "EventService": "./event/service",
    "CompetitionStatusService": "./competitionStatus/service",
    "CompetitionOddsService": "./competitionOdds/service",
}

async function loadClassesByName(name: string) {

    if (name in moduleMapper) {
        const module = await import(moduleMapper[name as keyof typeof moduleMapper]);
        return module[name];
    }
    throw new Error("Module not found");
}

type ServiceKey = keyof typeof moduleMapper;

export type ServiceContext = {services: { [key: string]: ServiceKey | [ServiceKey, { parent: string }] }, live?: boolean}

function buildNextParentKey(parentKey: string, key: string) {
    if (parentKey == null || parentKey === "") {
        return key;
    }
    return `${parentKey}.${key}`;
}

export async function replaceRefs<T>(data: T, serviceContext: ServiceContext, parentKey = ''): Promise<T> {
    if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            data[i] = await replaceRefs(data[i], serviceContext, parentKey);
        }
    } else if (typeof data === 'object' && data !== null) {
        for (const [key, value] of Object.entries(data)) {
            if (key in serviceContext.services && typeof value === "object") {
                // console.log("ParentKey | key: ", parentKey, "|", key);
                if (value.hasOwnProperty("$ref") && key !== parentKey) {
                    // if(parentKey === "competitors.athlete.eventLog.events" && key == "competition"){
                    //     console.log("Received nested competition object... going to parse it with these keys");
                    //     const ServiceClass = await loadClassesByName("CompetitionService");
                    //     const service = new ServiceClass(value.$ref, serviceContext);
                    //     const fetchedData = await service.get();
                    //     console.log(parentKey);
                    //     console.log("Fetched Data: ", fetchedData);
                    //     continue;
                    // }
                    // console.log("Has Own Property: ", key);
                    const serviceContextValue = serviceContext.services[key];
                    if (typeof serviceContextValue === "string") {
                        // Avoid Infinite recursion in statistics/athlete;
                        // console.log("contextValue == string, ", key, parentKey);
                        // if (key !== parentKey) {
                        // console.log("Calling Service: ", serviceContextValue);
                        const ServiceClass = await loadClassesByName(serviceContextValue);
                        const service = new ServiceClass(value.$ref, serviceContext);
                        // console.log("Calling ReplaceRefs from string Context", key, parentKey);
                        // @ts-ignore
                        data[key as keyof typeof data] = await replaceRefs(await service.get(), serviceContext, buildNextParentKey(parentKey, key));
                        // }
                    } else {
                        const [serviceName, {parent}] = serviceContextValue; // as [string, { parent: string }];
                        // console.log("PASSED PARENT KEY REQUIREMENT. Key: ", key, " ParentKey: ", parentKey, "Parent: ", parent);
                        if (parent === parentKey) {
                            // console.log("Calling Service: ", serviceName);
                            const ServiceClass = await loadClassesByName(serviceName);
                            const service = new ServiceClass(value.$ref, serviceContext);
                            // console.log("Calling ReplaceRefs from array Context", key, parentKey);
                            // @ts-ignore
                            data[key as keyof typeof data] = await replaceRefs(await service.get(), serviceContext, buildNextParentKey(parentKey, key));
                        }
                    }
                } else {
                    // console.log("No $ref: ParentKey | key: ", parentKey, "|", key);
                    // console.log("Calling ReplaceRefs from value doesn't have $ref");
                    await replaceRefs(value, serviceContext, buildNextParentKey(parentKey, key));
                }
            } else if (Array.isArray(value)) {
                // console.log("Array: ParentKey | key: ", parentKey, "|", key);
                // console.log("Called ReplaceRefs from isArray else: ", key);
                await replaceRefs(value, serviceContext, buildNextParentKey(parentKey, key));
            }
        }
    }
    return data;
}
