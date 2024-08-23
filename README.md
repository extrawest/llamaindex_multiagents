# Analysis Agent

This project is a multiagent Node.js application that uses advanced AI and natural language processing techniques to analyze and answer questions about the provided resources and related information. It combines document parsing, vector storage, and an AI agent to provide intelligent responses. You can find several variations including simple agent, rag and vector embeddings.

## Technologies and Frameworks Used

-   **Node.js**: The runtime environment for executing the TypeScript code.
-   **TypeScript**: The programming language used for the project.

### Libraries and Packages

-   **LlamaIndex**: A data framework for LLM-based applications.
-   **OpenAI**: For accessing GPT-4 language model.
-   **dotenv**: For loading environment variables.
-   **fs/promises**: For asynchronous file system operations.

### External Services and Tools

-   **OpenAI API**: Used for natural language processing tasks.
-   **Qdrant**: Vector database for efficient similarity search.
-   **HuggingFace**: For embedding model.

## Key Concepts and Features

1. **Document Parsing**: Uses LlamaParseReader to parse PDF documents into markdown format.
2. **Vector Storage**: Utilizes QdrantVectorStore for efficient storage and retrieval of document embeddings.
3. **Embedding**: Employs HuggingFaceEmbedding with the "BAAI/bge-small-en-v1.5" model for text embedding.
4. **Query Engine**: Implements a query engine for retrieving relevant information from the parsed documents.
5. **AI Agent**: Uses OpenAIAgent with custom tools for answering queries and performing calculations.
6. **Caching**: Implements a simple caching mechanism to avoid re-parsing previously processed documents.

## Setup and Configuration

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Install `tsx` globally (if not already installed):

    ```bash
    npm install -g tsx
    ```

    Note: Installing tsx globally allows you to run TypeScript files directly without compiling them first.

4. Create a `.env` file with the following variables:
    - `OPENAI_API_KEY`: Your OpenAI API key
5. Set up Qdrant:
    - Option 1: Ensure you have Qdrant running locally on port 6333.
    - Option 2: Run Qdrant in Docker (recommended for easy setup):

### Running Qdrant in Docker

To run Qdrant in Docker, follow these steps:

1. Make sure you have Docker installed on your system.
2. Open a terminal and run the following command:

```bash
docker run -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

## Usage

Run the script with:

`npx tsx index.ts`

## Input Data

The project expects input data in PDF format. Place your PDF files in the `./data/` directory. The current setup uses the file `sf_budget_2023_2024.pdf`.

### Adding New Documents

To add new documents for analysis:

1. Place the PDF file in the `./data/` directory.
2. Add the file path to the `filesToParse` array in the `index.ts` file.

Example:

```typescript
const filesToParse = ['./data/sf_budget_2023_2024.pdf'];
```
