import {useState, useEffect} from 'react';
import {Button, Modal, Box, Label, Select} from "@adminjs/design-system";

const GetEventsForPromotion = (props: any) => {
    console.log("Props: ", Object.keys(props));
    // const [isOpen, setIsOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState('ufc');

    const handleSubmit = async () => {
        const payload = {dropdownValue: selectedPromotion};
        console.log("Payload: ", payload);
        // Could just invoke the handler internally from here :)
        const response = await fetch(`/api/internal/promotion/${selectedPromotion}/events`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log("Response: ", response);
        // const response = await
    }

    useEffect(() => {
        console.log("Selected Promotion: ", selectedPromotion);
    }, [selectedPromotion]);

    return (
        <Box>
            <Modal>
                <Label htmlFor="promotion">Select Promotion: {selectedPromotion}</Label>
                <Select
                    id={"promotion"}
                    value={selectedPromotion}
                    onChange={(e) => {
                        setSelectedPromotion(e.value)
                    }}
                    options={[
                        {value: 'ufc', label: "UFC"},
                        {value: 'pfl', label: "PFL"},
                        {value: 'one', label: "ONE"},
                    ]}
                />
                <Button onClick={handleSubmit}>Fetch Events</Button>
            </Modal>
        </Box>
    )
}

export default GetEventsForPromotion;
