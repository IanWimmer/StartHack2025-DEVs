export interface ContextData {
    sixData: string[],
    portfolioDistribution: string,
    news: string[],
}

export async function getInsights(context: ContextData, portfolio: any | undefined, userQuery: string): Promise<string[] | undefined> {
    try {
        const query = generateInsightsLlmPrompt(context, portfolio, userQuery);

        const response = await fetch(`https://idchat-api-containerapp01-dev.orangepebble-16234c4b.switzerlandnorth.azurecontainerapps.io/llm?query=${query}`, {
            method: "POST",
        });
        const rawData = await response.json();
        console.log(rawData);
        
        const content: string = rawData.content ?? "";

        return extractResponseText(content);
    } catch (error) {
        console.error(`Error calling:`, error);
        return undefined
    }
}

function generateInsightsLlmPrompt(context: ContextData, portfolio: any | undefined, userQuery: string) {
    return `
        You will be acting as a part of a pipeline meant to provide wealth managers, portfolio managers and financial analysts with valuable insights in their decision making regarding their queries. It enables a completely novel human-AI interaction where users can work with information with minimal text input. At the end of the pipeline, components like charts, text paragraphs and KPIs will be generated that are relevant to the user's query.

        You should adhere to the provided specifications completely.

        In this stage, you decide which insights to generate for the user's dashboard based on the context data (from SIX and other sources), the query he provided and if applicable, the portfolio of the client. The information you're about to receive has been carefully curated and you have to decide which ones matter at this moment and fit the goal of providing valuable insight for the user's query best.

        Every insight is a card, here are the types that can be provided to the dashboard:
        - type LineData, CandleData and PieData: Charts for specific data series (PieData for numbers that always add up to 100 percent, CandleData for price histories)
        - type KpiData: A singular relevant performance metric. A number with a footer text
        - type NewsData: A snippet of a relevant news article.
        - type TableData: A table of relevant data, like a summary.

        Generally, you are free to choose which insights you generate. However, you should follow these rules:
        - If a portfolio is given, always include a pie chart that shows how their assets are distributed across different domains (available in the context data)
        - If you have multiple news articles given, only select one relevant headline at most!

        Context data:
        ${formatContextData(context)}

        Here is the user's question: ${userQuery}
        ${portfolio ? `If the user refers to a portfolio, it means this portfolio of a client he manages: ${JSON.stringify(portfolio)}` : "There is no portfolio for this query."}

        Do NOT repeat the data, only refer to the label [Label] of the context data and describe in natural language what data goes into the insight card and how. Do NOT hallucinate, only generate insights from the context data you are given. Give every insight you generate a summarizing title. Example:
        <example>
        [SIX_Data 1] Title: "Apple price change". Show in candle chart.
        [SIX_Data 2] Title: "Apple revenue". Show revenue field as KPI (number: revenue, footer: "Revenue in 2023")
        [News 1] Title: title of the news article. Show.
        </example>

        What are the insights that you deem valuable enough for the user to gain knowledge for their situation? Aim to generate exactly five insights! Think first before you respond. Put your response in <response></response> tags.
    `.trim();
}

export const formatContextData = (data: ContextData): string => {
    // Format SIX data
    const sixDataFormatted = data.sixData.map((entry, index) => `[SIX_Data ${index + 1}] ${entry}`).join("\n");

    // Format Portfolio Distribution
    const portfolioFormatted = data.portfolioDistribution ? `[Portfolio_Dist] ${data.portfolioDistribution}` : "";

    // Format News
    const newsFormatted = data.news.map((entry, index) => `[News ${index + 1}] ${entry}`).join("\n");

    // Combine all sections, removing any empty ones
    return [sixDataFormatted, portfolioFormatted, newsFormatted].filter(Boolean).join("\n\n");
};

const extractResponseText = (input: string): string[] => {
    const regex = /<response>([\s\S]*?)<\/response>/g;
    const matches = Array.from(input.matchAll(regex)); // Convert to array

    return matches.map(match => match[1]); // Extract text inside the tags
};