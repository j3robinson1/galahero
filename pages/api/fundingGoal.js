export default async function handler(req, res) {
    const url = 'https://nftharbor.io/rest/V1/API/GetAssetDetail';
    const payload = {
        Category: "Nodes",
        Collection: "Node",
        Guid: "none",
        Name: "FoundersNode",
        Rarity: "Ancient",
        SignGuid: "none",
        Version: "4.1"
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.data && data.data.Listings && data.data.Listings.length > 0) {
            const curPrice = data.data.Listings[0].curPrice;
            res.status(200).json({ curPrice });
        } else {
            throw new Error("No listings found or malformed data structure.");
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
