export async function getPortfolioDistribution(portfolio: any): Promise<string[] | undefined> {
    try {
        const query = generatePortfolioDistributionLlmPrompt(portfolio);

        const response = await fetch(`https://idchat-api-containerapp01-dev.orangepebble-16234c4b.switzerlandnorth.azurecontainerapps.io/llm?query=${query}`, {
            method: "POST",
        });
        const rawData = await response.json();
        
        const content: string = rawData.content ?? "";

        return extractResponseText(content);
    } catch (error) {
        console.error(`Error calling:`, error);
        return undefined
    }
}

function generatePortfolioDistributionLlmPrompt(portfolio: any): string {
    return `
        You will be acting as a part of a pipeline meant to provide wealth managers, portfolio managers and financial analysts with valuable insights in their decision making regarding their queries. It enables a completely novel human-AI interaction where users can work with information with minimal text input. At the end of the pipeline, components like charts, text paragraphs and KPIs will be generated that are relevant to the user's query.

        You should adhere to the provided specifications completely.

        In this stage, you will analyze the provided portfolio of the client and determine how their assets are distributed across different domains. You return a JSON-formatted response where the domain names (e.g. natural resources, real estate, technology, ...) are the keys and the values are how many percent of the portfolio they inhibit. The percentages should ALWAYS add up to 100 percent.

        Here is an example of how you respond:
        <example>{"Natural resources": 0.45, "Real estate": 0.2, "Technology": 0.35}</example>

        This is the portfolio you should analyze: ${JSON.stringify(portfolio)}

        How are their assets distributed? Think first before you respond. Adhere strictly to the JSON format and put your response in <response></response> tags.
    `.trim();
}

const extractResponseText = (input: string): string[] => {
    const regex = /<response>([\s\S]*?)<\/response>/g;
    const matches = Array.from(input.matchAll(regex)); // Convert to array

    return matches.map(match => match[1]); // Extract text inside the tags
};