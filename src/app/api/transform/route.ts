import {NextRequest, NextResponse} from 'next/server';
import OpenAI from 'openai';
import logger from '@/utils/logger';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

// Get the model from environment variables or use a default
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export async function POST(req: NextRequest) {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
        logger.error("OpenAI API key is missing");
        return NextResponse.json(
            {error: 'Server configuration error'},
            {status: 500}
        );
    }

    try {
        const {data, headers, transformationPrompt, hasHeaders = true, outputFormat = 'csv'} = await req.json();

        if (!data || !Array.isArray(data) || data.length === 0) {
            return NextResponse.json(
                {error: 'Invalid data format or empty data'},
                {status: 400}
            );
        }

        if (!transformationPrompt || typeof transformationPrompt !== 'string') {
            return NextResponse.json(
                {error: 'Transformation prompt is required'},
                {status: 400}
            );
        }

        // Build the system prompt for OpenAI
        const systemPrompt = `You are a data transformation assistant. Your task is to transform each row of data according to these instructions: "${transformationPrompt}".
Follow these strict rules:
1. Transform the data as per the user's instructions.
2. Return the transformed data in the specified JSON format with column headers as keys.
3. Maintain the same number of columns for each row unless explicitly instructed to add or remove columns.
4. DO NOT add any explanations or comments in your response.`;

        // Convert the data to a string format that's easier for the model to understand
        const headerStr = headers.join(',');
        const exampleDataStr = data.slice(0, 5).map(row => row.join(',')).join('\n');

        // Modify the prompt to include information about whether the file has headers
        let userPrompt = `Here is the data structure:
Headers: ${headerStr}`;

        // If file has no original headers, inform the model these are generated headers
        if (!hasHeaders) {
            userPrompt += `\n(Note: These headers were auto-generated because the original file had no headers.)`;
        }

        userPrompt += `\n\nHere are some example rows:
${exampleDataStr}

Instructions: ${transformationPrompt}

Transform ALL rows according to the instructions. Return the transformed data as a JSON object where each row is represented as an object with column headers as keys.`;

        // Process data in batches to avoid token limits
        const batchSize = 30;
        const transformedResults = [];

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, Math.min(i + batchSize, data.length));
            const batchDataStr = batch.map(row => row.join(',')).join('\n');

            const requestPayload: OpenAI.Chat.ChatCompletionCreateParams = {
                model: MODEL,
                messages: [
                    {role: 'system', content: systemPrompt},
                    {role: 'user', content: userPrompt},
                    {role: 'user', content: `Transform these rows:\n${batchDataStr}`}
                ],
                temperature: 0, // Use zero temperature for deterministic results
                response_format: {type: "json_object"}
            };

            logger.debug('Sending OpenAI request', requestPayload);
            const response = await openai.chat.completions.create(requestPayload);
            logger.debug('Received OpenAI response', response.choices[0]);



            // Extract the function arguments which contain our JSON data
            try {
                const content = response.choices[0].message.content?.trim() || '{}';
                const jsonResponse = JSON.parse(content);
                const transformedData = jsonResponse.data || [];
                transformedResults.push(...transformedData);
            } catch (error) {
                throw new Error(`Failed to parse OpenAI JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        // If the requested output is CSV or similar formats, convert the JSON objects to arrays
        if (outputFormat !== 'json') {
            // Extract all unique keys to ensure consistent columns
            const allKeys = new Set<string>();
            transformedResults.forEach(row => {
                Object.keys(row).forEach(key => allKeys.add(key));
            });

            // Convert objects to arrays based on headers order or all keys if needed
            const orderedKeys = hasHeaders ? headers : Array.from(allKeys);
            const transformedData = transformedResults.map(row => {
                return orderedKeys.map((key: string | number) => (row[key] || '').toString());
            });

            return NextResponse.json({transformedData, headers: orderedKeys});
        }

        // Return JSON format directly
        return NextResponse.json({
            transformedData: transformedResults,
            headers: Object.keys(transformedResults[0] || {})
        });

    } catch (error) {
        console.error('Error transforming data:', error);

        return NextResponse.json(
            {error: `Error transforming data: ${error instanceof Error ? error.message : 'Unknown error'}`},
            {status: 500}
        );
    }
}