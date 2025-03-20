export async function GET(request: Request) {
    const query = "What are current market trends in the energy sector?";

    //const summaryData = await getSummary(query);
    //const companyData = await getCompanyDataSearch(query);
    //const searchData = await getSearchWithCriteria(query);
    //const ohlcvData = await getOhlcv(query, "01.09.2024", "30.09.2024")
    const llmResponse = await getLlm(query);

    if (llmResponse) {
        return new Response(llmResponse, {
            status: 200,
            headers: { "Content-Type": "text/plain" },
        });
    }
    else {
        return new Response("Error fetching data", { status: 500 });
    }
}

async function getSummary(query: string): Promise<string | undefined> {
    try {
        const response = await fetch(`https://idchat-api-containerapp01-dev.orangepebble-16234c4b.switzerlandnorth.azurecontainerapps.io/summary?query=${query}`, {
            method: "POST",
        });
        const rawData = await response.json();

        // First, parse the stringified "object" field
        const objectData = JSON.parse(rawData?.object || "{}");

        // Extract the "data" field (which is an array containing a JSON string)
        const dataArray = objectData?.data ?? [];

        // Return the first element of the data array as a raw string
        const dataString = dataArray.length > 0 ? dataArray[0] : "No data available";

        return dataString
    } catch (error) {
        console.error(`❌ Error calling:`, error);
        return undefined
    }
}

async function getCompanyDataSearch(query: string): Promise<string | undefined> {
    try {
        const response = await fetch(`https://idchat-api-containerapp01-dev.orangepebble-16234c4b.switzerlandnorth.azurecontainerapps.io/companydatasearch?query=${query}`, {
            method: "POST",
        });
        const rawData = await response.json();

        // First, parse the stringified "object" field
        const objectData = JSON.parse(rawData?.object || "{}");

        // Extract the "data" field (which is an array containing a JSON string)
        const dataArray = objectData?.data ?? [];

        // Return the first element of the data array as a raw string
        const dataString = dataArray.length > 0 ? dataArray[0] : "No data available";

        return dataString
    } catch (error) {
        console.error(`❌ Error calling:`, error);
        return undefined
    }
}

async function getSearchWithCriteria(query: string): Promise<string | undefined> {
    try {
        const response = await fetch(`https://idchat-api-containerapp01-dev.orangepebble-16234c4b.switzerlandnorth.azurecontainerapps.io/searchwithcriteria?query=${query}`, {
            method: "POST",
        });
        const rawData = await response.json();

        // First, parse the stringified "object" field
        const objectData = JSON.parse(rawData?.object || "{}");

        // Extract the "data" field (which is an array containing a JSON string)
        const dataArray = objectData?.data ?? [];

        // Return the first element of the data array as a raw string
        const dataString = dataArray.length > 0 ? dataArray[0] : "No data available";

        return dataString
    } catch (error) {
        console.error(`❌ Error calling:`, error);
        return undefined
    }
}

async function getOhlcv(query: string, from: string, to: string): Promise<string | undefined> {
    try {
        const response = await fetch(`https://idchat-api-containerapp01-dev.orangepebble-16234c4b.switzerlandnorth.azurecontainerapps.io/ohlcv?query=${query}&first=${from}&last=${to}`, {
            method: "POST",
        });
        const rawData = await response.json();

        // Step 1: Extract and parse the "object" field
        const parsedObject = JSON.parse(rawData?.object || "{}");

        // Step 2: Extract and parse the "data" field (which is still a string)
        const dataJsonString = parsedObject?.data ?? "{}"; // Default to empty object if missing
        const parsedData = JSON.parse(dataJsonString);

        // Step 3: Extract OHLCV data for the given stock (assumes single stock)
        const stockName = Object.keys(parsedData)[0];
        if (!stockName) {
            console.error("❌ No stock data found");
            return undefined;
        }

        const ohlcvString = parsedData[stockName];

        return ohlcvString
    } catch (error) {
        console.error(`❌ Error calling:`, error);
        return undefined
    }
}

async function getLlm(query: string): Promise<string | undefined> {
    try {
        const response = await fetch(`https://idchat-api-containerapp01-dev.orangepebble-16234c4b.switzerlandnorth.azurecontainerapps.io/llm?query=${query}`, {
            method: "POST",
        });
        const rawData = await response.json();

        // First, parse the stringified "object" field
        const llmResponseText = rawData?.content ?? "No response available.";

        return llmResponseText;
    } catch (error) {
        console.error(`❌ Error calling:`, error);
        return undefined
    }
}