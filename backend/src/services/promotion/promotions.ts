import {ESPNPromotion} from "./espnPromotion";


export function getPromotionClass(promotionSlug: string) {
    const espnPromotions = ["ufc", "pfc", "bellator"]
    const secondaryPromotions = ["bfl", "lfa", "one", "cage-warriors"]

    if (espnPromotions.includes(promotionSlug)) {
        return ESPNPromotion
    } else if (secondaryPromotions.includes(promotionSlug)) {
        return null
    } else {
        console.error("League Not Yet Implemented: ", promotionSlug)
    }
    return;
}
