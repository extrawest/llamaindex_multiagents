import {
    OpenAI,
    FunctionTool,
    OpenAIAgent,
    Settings,
    SimpleDirectoryReader,
    HuggingFaceEmbedding,
    VectorStoreIndex,
    QueryEngineTool,
} from 'llamaindex';
import 'dotenv/config';

async function main() {
    console.log('Initializing LLM...');
    Settings.llm = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,

        model: 'gpt-3.5-turbo',
    });
    Settings.embedModel = new HuggingFaceEmbedding({
        modelType: 'BAAI/bge-small-en-v1.5',
        quantized: false,
    });
    const reader = new SimpleDirectoryReader();
    const documents = await reader.loadData('./data');
    const index = await VectorStoreIndex.fromDocuments(documents);
    const retriever = await index.asRetriever();
    retriever.similarityTopK = 10;
    const queryEngine = await index.asQueryEngine({
        retriever,
    });
    const tools = [
        new QueryEngineTool({
            queryEngine: queryEngine,
            metadata: {
                name: 'san_francisco_budget_tool',
                description: `This tool can answer detailed questions about the individual components of the budget of San Francisco in 2023-2024.`,
            },
        }),
    ];
    // create the agent
    const agent = new OpenAIAgent({ tools });

    let response = await agent.chat({
        message: "What's the budget of San Francisco in 2023-2024?",
    });

    console.log(response);
}

main().catch(console.error);
