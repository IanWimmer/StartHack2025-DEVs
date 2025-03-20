export function getSummary(dataArray: string[]): string {
    const dataString = dataArray.length > 0 ? dataArray[0] : "No data available";

    return dataString
}

export function getCompanyDataSearch(dataArray: string[]): string | undefined {
    // Return the first element of the data array as a raw string
    if (dataArray.length <= 0) {
        return "No data available";
    }

    const restructured = restructureCompanyData(JSON.parse(dataArray[0]));

    return JSON.stringify(restructured)
}

export function getSearchWithCriteria(dataArray: string[]): string | undefined {
    // Return the first element of the data array as a raw string
    if (dataArray.length <= 0) {
        return "No data available";
    }
    const restructured = restructureCompanyData(JSON.parse(dataArray[0]));

    return JSON.stringify(restructured)
}

export function getOhlcv(data: string): string | undefined {
    const parsedData = JSON.parse(data);

    // Step 3: Extract OHLCV data for the given stock (assumes single stock)
    const stockName = Object.keys(parsedData)[0];
    if (!stockName) {
        console.error("No stock data found");
        return undefined;
    }

    const ohlcv = JSON.parse(parsedData[stockName]);
    const limited = limitOHLCVEntries(ohlcv);

    return stockName + ":" + JSON.stringify(limited);
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