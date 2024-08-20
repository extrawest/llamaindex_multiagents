import { Ollama, FunctionTool, Settings, ReActAgent } from 'llamaindex';
import type { JSONValue } from '@llamaindex/core/global';
import type { BaseTool, ToolMetadata } from '@llamaindex/core/llms';
import type { JSONSchemaType } from 'ajv';
async function main() {
    console.log('Initializing LLM...');
    Settings.llm = new Ollama({
        model: 'mistral',
    });
    Settings.callbackManager.on('llm-tool-call', (event) => {
        console.log(event.detail.toolCall);
    });
    Settings.callbackManager.on('llm-tool-result', (event) => {
        console.log(event.detail.toolResult);
    });
    const sumNumbers = ({ a, b }) => {
        return a + b;
    };

    const tool = FunctionTool.from(sumNumbers, {
        name: 'sumNumbers',
        description: 'Use this function to sum two numbers. ',
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
        } as any,
    });
    console.log('tool>>>', tool);

    const tools = [tool];
    const agent = new ReActAgent({ tools });
    let response = await agent.chat({
        message: 'Add 101 and 303',
    });
    console.log(response.message.content);
}

main();
