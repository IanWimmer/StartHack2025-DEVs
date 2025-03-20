import { ContextData } from "./getInsights";

export async function getComponents(context: ContextData, insights: string): Promise<string[] | undefined> {
    try {
        const query = generateComponentsLlmPrompt(context, insights);

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

function generateComponentsLlmPrompt(context: ContextData, insights: string) {
    return `
        You will be acting as a part of a pipeline meant to provide wealth managers, portfolio managers and financial analysts with valuable insights in their decision making regarding their queries. It enables a completely novel human-AI interaction where users can work with information with minimal text input. At the end of the pipeline, components like charts, text paragraphs and KPIs will be generated that are relevant to the user's query.

        You should adhere to the provided specifications completely.

        In this stage, your only job is to generate the JSON for financial insights devised by another model. You are given context data that are labeled, along with a natural language description of how they should be transformet to insight cards. Pay close attention to these instructions and replicate the context data accurately.

        Every insight is a card, here is the JSON format of what can be provided to the dashboard:
        type OrchestratorData = {
            type: "line" | "candle" | "news" | "kpi" | "pie" | "table",
            title: string,
            data: LineData | CandleData | PieData | KpiData | NewsData | TableData
        }[]
        type KpiData = {
            number: number
            footer: string
        }
        type NewsData = {
            content: string,
            source: string
        }
        type TableData = {
            header: string[],
            content: {
                [key: string]: string
            }[]
        }
        type LineData = AxisChartDataList;
        type CandleData = AxisChartDataList;
        type AxisChartDataList = {
            x: Date,
            y: number | number[],
        }
        type PieData = number[];

        Your top-level element should be of type OrchestratorData. Define the type for each element correctly. You can copy the title from the financial insights directly. Copy the data as well. For PieData, the numbers in the array always have to add up to 100. For LineData, use elements of the form {
            x: Date,
            y: number,
        }. For CandleData, use elements of the form {
            x: Date,
            y: number[],
        } where y is a list of four numbers: [open, high, low, close].

        Context data:
        ${formatContextData(context)}

        The financial insights by label:
        ${insights}

        Translate this to a JSON string that can be parsed correctly. Put your response in <response></response> tags. Think first before you respond.
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