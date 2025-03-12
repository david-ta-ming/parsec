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
2. The input data will be provided as JSON objects where each object represents a row with column headers as keys.
3. Return the transformed data in the same JSON format with column headers as keys.
4. Maintain the same number of columns for each row unless explicitly instructed to add or remove columns.
5. DO NOT add any explanations or comments in your response.
6. Your response must be a valid JSON object with a 'data' field containing an array of transformed row objects.`;

        // Check if the input data is already in JSON object format or needs conversion
        let dataJson: Record<string, string>[];

        // If the first item is an object, assume the entire data is already in object format
        if (data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
            dataJson = data;
        } else {
            // Convert array data to structured JSON for safer handling
            dataJson = data.map(row => {
                const rowObj: Record<string, string> = {};
                headers.forEach((header: string | number, index: number) => {
                    if (index < row.length) {
                        rowObj[header.toString()] = row[index];
                    }
                });
                return rowObj;
            });
        }

        // Create example rows for the prompt
        const exampleRows = dataJson.slice(0, 5);

        // Create a JSON representation of the headers and example data
        const dataStructure = {
            headers: headers,
            exampleRows: exampleRows,
            hasOriginalHeaders: hasHeaders
        };

        // Modify the prompt to include structured data
        let userPrompt = `Here is the data structure in JSON format:
${JSON.stringify(dataStructure, null, 2)}`;

        // If file has no original headers, inform the model these are generated headers
        if (!hasHeaders) {
            userPrompt += `\n(Note: The headers were auto-generated because the original file had no headers.)`;
        }

        userPrompt += `\n\nInstructions: ${transformationPrompt}

Transform ALL rows according to the instructions. Return the transformed data as a JSON object where each row is represented as an object with column headers as keys.`;

        // Process data in batches to avoid token limits
        const batchSize = 30;
        const batchPromises = [];

        for (let i = 0; i < dataJson.length; i += batchSize) {
            const batch = dataJson.slice(i, Math.min(i + batchSize, dataJson.length));

            const requestPayload: OpenAI.Chat.ChatCompletionCreateParams = {
                model: MODEL,
                messages: [
                    {role: 'system', content: systemPrompt},
                    {role: 'user', content: userPrompt},
                    {role: 'user', content: `Transform these rows:\n${JSON.stringify(batch, null, 2)}`}
                ],
                temperature: 0, // Use zero temperature for deterministic results
                max_tokens: 16384,
                response_format: { type: "json_object" }
            };

            logger.debug(`Sending batch starting at index ${i}; size: ${batch.length}`);

            batchPromises.push(
                (async () => {
                    let attempt = 0;
                    const maxRetries = 3;

                    while (attempt < maxRetries) {
                        try {
                            const response = await openai.chat.completions.create(requestPayload);
                            const content = response.choices[0].message.content?.trim() || '{}';
                            const jsonResponse = JSON.parse(content);

                            logger.debug(`Received batch starting at index ${i}; size: ${jsonResponse.data.length}`);
                            logger.debug(`Usage: ${JSON.stringify(response.usage)}`);

                            if (jsonResponse.data.length !== batch.length) {
                                logger.warn(`WARNING: Attempt ${attempt + 1}: Expected ${batch.length} rows but received ${jsonResponse.data.length}. Retrying...`);
                            } else {
                                return jsonResponse.data || [];
                            }

                            logger.debug(`Batch: ${JSON.stringify(batch, null, 2)}`);
                            logger.debug(`Response.data: ${JSON.stringify(jsonResponse.data, null, 2)}`);

                        } catch (error) {
                            logger.error(`Batch ${i} failed on attempt ${attempt + 1}: ${error}`);
                        }

                        attempt++;
                    }

                    logger.error(`Batch ${i} failed after ${maxRetries} retries.`);

                    throw new Error(`Batch ${i} failed after ${maxRetries} retries.`);
                })()
            );

        }

        // Promise.all preserves the order of batches as created above
        const batchResults = await Promise.all(batchPromises);

        // Flatten the results into a single array; rows remain in order.
        const transformedResults = batchResults.flat();
        logger.debug(`Transformed results: ${transformedResults.length}`);

        // If the requested output is JSON, return the JSON objects directly
        if (outputFormat === 'json') {
            // Return JSON format directly
            return NextResponse.json({
                transformedData: transformedResults,
                headers: Object.keys(transformedResults[0] || {})
            });
        } else {
            // Extract all unique keys to ensure consistent columns
            const allKeys = new Set<string>();
            transformedResults.forEach(row => {
                Object.keys(row).forEach(key => allKeys.add(key));
            });

            // Convert objects to arrays based on headers order or all keys if needed
            const orderedKeys = hasHeaders ? headers : Array.from(allKeys);
            const transformedData = transformedResults.map(row => {
                return orderedKeys.map((key: string | number) => (row[key.toString()] || '').toString());
            });

            return NextResponse.json({transformedData, headers: orderedKeys});
        }

    } catch (error) {
        logger.error('Error transforming data:', error);

        return NextResponse.json(
            {error: `Error transforming data: ${error instanceof Error ? error.message : 'Unknown error'}`},
            {status: 500}
        );
    }
}