import { getToolsFromLlm } from "./getToolsFromLlm";
import { getSummary, getCompanyDataSearch, getOhlcv, getSearchWithCriteria } from "./tools";

export async function POST(request: Request) {
    try {
        // Parse request body
        const { query, portfolio } = await request.json();

        if (!query || !portfolio) {
            return new Response(JSON.stringify({ error: "Missing query or portfolio data" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Placeholder response (we will add logic later)
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Step 1: Send user query and portfolio to SIX LLM to decide queries
                    await sendMessage(controller, encoder, "Analyzing problem solving strategy...");
                    const toolList = await getToolsFromLlm(query, portfolio);

                    // Step 2: Fetch data from relevant APIs
                    let dataResults: string[] = [];

                    if (toolList) {
                        for (const tool of toolList) {
                            await sendMessage(controller, encoder, `Processing ${tool.name}...`);
    
                            let result: string | undefined = undefined;
    
                            switch (tool.name) {
                                case "Show_Summary":
                                    result = await getSummary(tool.arguments);
                                    break;
                                case "Company_Data_Search":
                                    result = await getCompanyDataSearch(tool.arguments);
                                    break;
                                case "Search_With_Criteria":
                                    result = await getSearchWithCriteria(tool.arguments);
                                    break;
                                case "Historical_Price_Data":
                                    result = await getOhlcv(tool.arguments);
                                    break;
                            }
    
                            if (result) {
                                dataResults.push(result);
                            }
                        }
                    }

                    // Simulate final processed JSON data
                    const finalData = {
                        analysis: "Portfolio analysis complete",
                        recommendations: [
                            { ticker: "AAPL", action: "Hold", confidence: 0.85 },
                            { ticker: "TSLA", action: "Sell", confidence: 0.65 },
                            { ticker: "GOOGL", action: "Buy", confidence: 0.90 },
                        ],
                        summary: dataResults,
                    };

                    // Send final JSON payload as the last message
                    await sendMessage(controller, encoder, `FINAL_JSON:${JSON.stringify(finalData)}`, 500);

                    controller.close(); // Close the stream when finished
                } catch (error) {
                    controller.enqueue(encoder.encode(`Error: ${error}\n`));
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: { "Content-Type": "text/plain" },
        });
    } catch (error) {
        console.error("Error in orchestrator:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}

async function sendMessage(controller: ReadableStreamDefaultController<any>, encoder: TextEncoder, message: string, delay = 1000) {
    controller.enqueue(encoder.encode(`${message}\n`));
    await new Promise((resolve) => setTimeout(resolve, delay));
}