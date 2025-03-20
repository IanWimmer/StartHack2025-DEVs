export async function GET(request: Request) {
    const query = "Apple";

    //const summaryData = await getSummary(query);
    //const companyData = await getCompanyDataSearch(query);
    //const searchData = await getSearchWithCriteria(query);
    const ohlcvData = await getOhlcv(query, "01.09.2024", "30.10.2024")

    if (ohlcvData) {
        return new Response(ohlcvData, {
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
        if (dataArray.length <= 0) {
            return "No data available";
        }

        const restructured = restructureCompanyData(JSON.parse(dataArray[0]));

        return JSON.stringify(restructured)
    } catch (error) {
        console.error(`Error calling:`, error);
        return undefined
    }
}

function restructureCompanyData(rawData: any): Record<string, any> {
    const transformedData: Record<string, any> = {};

    // Get company names from the "Name" field
    const companyNames = rawData["Name"];

    if (!companyNames) {
        console.error("No 'Name' field found in data.");
        return {};
    }

    // Iterate through each company entry (0, 1, etc.)
    Object.keys(companyNames).forEach((index) => {
        const companyName = companyNames[index];

        // Initialize company object
        transformedData[companyName] = {};

        // Assign all properties related to this company
        for (const key in rawData) {
            if (key !== "Name") {
                transformedData[companyName][key] = rawData[key][index];
            }
        }
    });

    return transformedData;
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
        if (dataArray.length <= 0) {
            return "No data available";
        }

        const restructured = restructureCompanyData(JSON.parse(dataArray[0]));

        return JSON.stringify(restructured)
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
            console.error("No stock data found");
            return undefined;
        }

        const ohlcv = JSON.parse(parsedData[stockName]);
        const limited = limitOHLCVEntries(ohlcv);

        return JSON.stringify(limited);
    } catch (error) {
        console.error(`Error calling:`, error);
        return undefined
    }
}

function limitOHLCVEntries(data: Record<string, any>, maxEntries: number = 30): Record<string, any> {
    // Convert object keys (dates) to an array and sort them in descending order (latest first)
    const sortedDates = Object.keys(data).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Keep only the latest 'maxEntries' entries
    const limitedDates = sortedDates.slice(0, maxEntries);

    // Sort these limited entries back into ascending order (oldest first)
    limitedDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Construct new object with correctly ordered entries
    const limitedData: Record<string, any> = {};
    for (const date of limitedDates) {
        limitedData[date] = data[date];
    }

    return limitedData;
}