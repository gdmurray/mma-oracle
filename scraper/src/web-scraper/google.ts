import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween"
dayjs.extend(isBetween);

function matchesDate(date: Date, snippet: string): boolean{
    const regex = /(\bJan\b|\bFeb\b|\bMar\b|\bApr\b|\bMay\b|\bJun\b|\bJul\b|\bAug\b|\bSep\b|\bOct\b|\bNov\b|\bDec\b)\s\d{1,2}\b/;
    const regexTwo = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s([1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?\b/;
    const regexes = [regex, regexTwo];
    const parseString = ["MMM DD, YYYY", "MMM DD"];

    return regexes.some(((reg, index) => {
        const matches = snippet.match(reg);
        // console.log("Matches: ", matches);
        if(matches){
            const foundDate = matches[0].replace("st", "").replace("nd", "").replace("rd", "").replace("th", "");
            let parsedDate = dayjs(foundDate, parseString[index]);
            parsedDate = parsedDate.set("year", dayjs(date).year());
            // console.log(parseString[index], parsedDate.toISOString(), dayjs(date).toISOString());
            const targetDate = dayjs(date);
            const betweenA = targetDate.subtract(2, "day");
            const betweenB = targetDate.add(2, "day");
            return parsedDate.isBetween(betweenA, betweenB);
        }
        return false;
    }))
}
export function findUrl(items: any[], date: Date){
    return items.filter((result) => {
        const isNotFuture = !result.link.includes("future-events");
        const snippetHasCorrectDate = matchesDate(date, result.snippet);
        // console.log("Is not Future: ", isNotFuture);
        // console.log("Snippet has Correct Date: ", snippetHasCorrectDate);
        if(isNotFuture && snippetHasCorrectDate){
            return result
        }
    })
}
export async function performSearch(query: string) {
    const apiKey = process.env["GOOGLE_SEARCH_API_KEY"];
    const cx = '226503e2ae1114410';
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        // @ts-ignore
        return data.items; // items contain the search results
    } catch (error) {
        console.error('Search failed:', error);
    }
}
