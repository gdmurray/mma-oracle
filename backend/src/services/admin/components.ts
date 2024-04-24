import {ComponentLoader} from "adminjs";

const componentLoader = new ComponentLoader();

const Components = {
    // Load components here
    GetEventsForPromotion: componentLoader.add('GetEventsForPromotion', "./getEventsForPromotion"),
}

export {componentLoader, Components};
