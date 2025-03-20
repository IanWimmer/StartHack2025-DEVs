import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import OpenAI from "openai";


interface NewsArticle {
    fragment: string,
    headline: string,
    source: string,
}

export async function getNewsArticle(userQuery: string, apiKey: string): Promise<string | undefined> {
    try {
        const client = new MilvusClient({
            address: '44.202.33.225:19530', // Replace with your EC2 Public IP
            token: 'root:Milvus'
        });
        const openai = new OpenAI({
            apiKey: apiKey
        });

        const embedding = await openai.embeddings.create({
            dimensions: 512,
            model: "text-embedding-3-large",
            input: userQuery,
            encoding_format: "float",
        });

        const embedding_vector = embedding?.data[0]?.embedding;

        const res = await client.search({
            collection_name: "news_article_data",
            data: embedding_vector,
            limit: 1,
        });
        if (res.status.error_code !== 'Success') {
            throw Error("Could not retreive VectorDB");
        }

        const return_val: NewsArticle = {
            fragment: res.results[0].fragment_text,
            headline: res.results[0].headline,
            source: res.results[0].source
        }

        return JSON.stringify(return_val);
    } catch (error) {
        console.error(`Error calling:`, error);
        return undefined
    }
}