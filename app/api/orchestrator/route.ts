import { getDataFromQuery } from "./getDataFromQuery";
import { getSummary, getCompanyDataSearch, getOhlcv, getSearchWithCriteria } from "./tools";
import { getPortfolioDistribution } from "./getPortfolioDistribution";
import { getNewsArticle } from "./getNewsArticle";
import { ContextData, getInsights } from "./getInsights";
import { getComponents } from "./getComponents";

export async function POST(request: Request) {
    try {
        // Parse request body
        const { apiKey, query, portfolio } = await request.json();

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
                    // Step 1: Send user query and portfolio to QUERY for data
                    await sendMessage(controller, encoder, "Gathering data for problem solving...");

                    const dataResults = await getDataFromQuery(portfolio, query) ?? [];
                    console.log(dataResults.length)

                    const toolList = dataResults.map((objStr) => JSON.parse(objStr));
                    console.log(toolList.length)

                    let restructuredData: string[] = [];

                    if (toolList.length > 0) {
                        for (const tool of toolList) {
                            console.log(`Processing ${tool.tool}...`);

                            let result: string | undefined = undefined;

                            switch (tool.tool) {
                                case "Summary":
                                    result = getSummary(tool.data);
                                    break;
                                case "PkData":
                                    result = getCompanyDataSearch(tool.data);
                                    break;
                                case "SearchWithCriteria":
                                    result = getSearchWithCriteria(tool.data);
                                    console.log("Fresh data: " + result)
                                    break;
                                case "OHLC":
                                    result = getOhlcv(tool.data);
                                    break;
                                default:
                                    console.warn(`Unknown tool: ${tool.tool}`);
                            }

                            if (result) {
                                restructuredData.push(result);
                            }
                        }
                    }

                    let portfolioDistribution: string | undefined = undefined 
                    // Step 2: Get portfolio distribution if applicable
                    if (portfolio) {
                        await sendMessage(controller, encoder, "Analyzing client portfolio...");

                        const dist = await getPortfolioDistribution(portfolio) ?? "";
                        if (dist) {
                            portfolioDistribution = dist[0];
                        }
                    }

                    // Step 3: Get news coverage from Milvus
                    await sendMessage(controller, encoder, "Collecting relevant news articles...");
                    const news = await getNewsArticle(query, apiKey) ?? "";

                    // Step 4: Generate insights
                    const finalData: ContextData = {
                        sixData: restructuredData,
                        portfolioDistribution: portfolioDistribution ?? "",
                        news: [news],
                    };
                    await sendMessage(controller, encoder, "Building insights...");
                    const insights = await getInsights(finalData, portfolio, query);
                    console.log(insights);

                    // Step 5: Generate JSON
                    if (!insights || insights.length == 0) {
                        await sendMessage(controller, encoder, `FINAL_JSON:{}`, 500);
                        controller.close(); // Close the stream when finished
                    }
                    else {
                        const componentJson = await getComponents(finalData, insights[0]);
                        console.log("Components: " + componentJson);

                        // Send final JSON payload as the last message
                        await sendMessage(controller, encoder, componentJson ? `FINAL_JSON:${componentJson}` : "FINAL_JSON:{}", 500);
                        controller.close(); // Close the stream when finished
                    }
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