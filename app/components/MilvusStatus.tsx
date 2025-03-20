import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import OpenAI from "openai";


async function listCollections(): Promise<boolean> {
    const client = new MilvusClient({
        address: '44.202.33.225:19530', // Replace with your EC2 Public IP
        token: 'root:Milvus'
    });
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_KEY!
    });

    const embedding = await openai.embeddings.create({
        dimensions: 512,
        model: "text-embedding-3-large",
        input: "Should I increase my exposure to crypto in my portfolio?",
        encoding_format: "float",
    });

    const embedding_vector = embedding?.data[0]?.embedding;

    const res = await client.search({
        collection_name: "news_article_data",
        data: embedding_vector,
        limit: 1,
    });
    console.log(res);

    try {
        const collections = await client.listCollections();
        //console.log(collections);
        return true;
    } catch (error) {
        console.error('Error listing collections:', error);
        return false;
    }
}

export default async function MilvusStatus() {
    const status = await listCollections();

    return <p>
        Milvus: <span>
            {status ? "✅ Up!" : "❌ Not reachable!"}
        </span>
    </p>
}