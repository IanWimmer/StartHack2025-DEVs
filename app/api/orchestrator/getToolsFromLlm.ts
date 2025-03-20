interface ToolCall {
    id: string;
    name: string;
    arguments: Record<string, any>; // Parsed JSON arguments
}


export async function getToolsFromLlm(portfolio: any | undefined, userQuery: string): Promise<ToolCall[] | undefined> {
    try {
        const query = generateToolsLlmPrompt(portfolio, userQuery);

        const response = await fetch(`https://idchat-api-containerapp01-dev.orangepebble-16234c4b.switzerlandnorth.azurecontainerapps.io/llm?query=${query}`, {
            method: "POST",
        });
        const rawData = await response.json();
        const toolCalls = rawData?.additional_kwargs?.tool_calls || [];

        return toolCalls.map((call: any) => ({
            id: call.id,
            name: call.function.name,
            arguments: JSON.parse(call.function.arguments) // Convert string to object
        }));;
    } catch (error) {
        console.error(`Error calling:`, error);
        return undefined
    }
}

function generateToolsLlmPrompt(portfolio: any | undefined, userQuery: string): string {
    return `
        You will be acting as a part of a pipeline meant to provide wealth managers, portfolio managers and financial analysts with valuable insights in their decision making regarding their queries. It enables a completely novel human-AI interaction where users can work with information with minimal text input. At the end of the pipeline, components like charts, text paragraphs and KPIs will be generated that are relevant to the user's query.

        You should adhere to the provided specifications completely.

        In this stage, you will write three queries to your tools (Summary, Search with criteria, Company data search, Historical price data). Do NOT use Winners_Losers, as its API is unavailable. Output the queries that should be made to these tools in their respectively correct formats. The results of the queries should be directly relevant to solve the user's question.

        ${portfolio && `If the user refers to a portfolio, it means the portfolio of a client he manages. This is the portfolio you should base your understanding of the user's question on: ${portfolio}`}

        Here is the user's question: ${userQuery}

        What information would you retreive from your tools to help the user solve his case? Think of companies whose data could be relevant. Restrict yourself to exactly three queries! Think first before you respond. 
    `.trim();
}