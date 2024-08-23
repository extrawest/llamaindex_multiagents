import {
    OpenAI,
    FunctionTool,
    OpenAIAgent,
    Settings,
    LlamaParseReader,
    HuggingFaceEmbedding,
    VectorStoreIndex,
    QueryEngineTool,
    QdrantVectorStore,
} from 'llamaindex';
import 'dotenv/config';
import fs from 'node:fs/promises';
import readline from 'readline';

async function main() {
    const PARSING_CACHE = './cache.json';
    let documents = [];
    // set LLM and the embedding model
    Settings.llm = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o',
    });
    Settings.embedModel = new HuggingFaceEmbedding({
        modelType: 'BAAI/bge-small-en-v1.5',
        quantized: false,
    });

    Settings.callbackManager.on('llm-tool-call', (event) => {
        // console.log(event.detail.payload);
    });
    Settings.callbackManager.on('llm-tool-result', (event) => {
        // console.log(event.detail.payload);
    });
    const vectorStore = new QdrantVectorStore({
        url: 'http://localhost:6333',
    });

    let cache = {};
    let cacheExists = false;
    try {
        await fs.access(PARSING_CACHE, fs.constants.F_OK);
        cacheExists = true;
    } catch (e) {
        console.log('No cache found');
    }
    if (cacheExists) {
        cache = JSON.parse(await fs.readFile(PARSING_CACHE, 'utf-8'));
    }

    const filesToParse = ['../data/sf_budget_2023_2024.pdf'];

    const reader = new LlamaParseReader({ resultType: 'markdown' });
    for (let file of filesToParse) {
        if (!cache[file]) {
            documents = documents.concat(await reader.loadData(file));
            cache[file] = true;
        }
    }

    // write the cache back to disk
    await fs.writeFile(PARSING_CACHE, JSON.stringify(cache));
    const index = await VectorStoreIndex.fromDocuments(documents, {
        vectorStore,
    });
    const retriever = await index.asRetriever();
    retriever.similarityTopK = 10;
    const queryEngine = await index.asQueryEngine({
        retriever,
    });

    const sumNumbers = ({ a, b }) => {
        return `${a + b}`;
    };

    const tools = [
        new QueryEngineTool({
            queryEngine: queryEngine,
            metadata: {
                name: 'san_francisco_budget_tool',
                description: `This tool can answer detailed questions about the individual components of the budget of San Francisco in 2023-2024.`,
            },
        }),
        FunctionTool.from(sumNumbers, {
            name: 'sumNumbers',
            description: 'Use this function to sum two numbers',
            parameters: {
                type: 'object',
                properties: {
                    a: {
                        type: 'number',
                        description: 'First number to sum',
                    },
                    b: {
                        type: 'number',
                        description: 'Second number to sum',
                    },
                },
                required: ['a', 'b'],
            },
        }),
    ];

    const agent = new OpenAIAgent({ tools });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const askQuestion = (query) => {
        return new Promise((resolve) => rl.question(query, resolve));
    };

    while (true) {
        const message = await askQuestion(
            "Enter your prompt (or 'exit' to quit): "
        );
        if (message.toLowerCase() === 'exit') {
            rl.close();
            break;
        }
        const response = await agent.chat({ message });
        console.log(response.message.content);
    }
}

main().catch(console.error);
