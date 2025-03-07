import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import logger from '@/utils/logger';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {

    try {

        const { data, headers, transformationPrompt, hasHeaders = true } = await req.json();

        if (!data || !Array.isArray(data) || data.length === 0) {
            return NextResponse.json(
                { error: 'Invalid data format or empty data' },
                { status: 400 }
            );
        }

        if (!transformationPrompt || typeof transformationPrompt !== 'string') {
            return NextResponse.json(
                { error: 'Transformation prompt is required' },
                { status: 400 }
            );
        }

        // Build the prompt for OpenAI
        const systemPrompt = `You are a data transformation assistant. Your task is to transform each row of data according to these instructions: "${transformationPrompt}".
Provide ONLY the transformed data values. Do not include explanations or descriptions.
Maintain the same number of columns for each row.
For date calculations, use standard algorithms and be perfectly consistent in your transformations.`;

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

Transform ALL rows according to the instructions. Return ONLY the transformed data in the exact same format (comma-separated values, one row per line). Preserve all columns.`;

        // Process data in batches to avoid token limits
        const batchSize = 10;
        const transformedData: string[][] = [];

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, Math.min(i + batchSize, data.length));
            const batchDataStr = batch.map(row => row.join(',')).join('\n');

            const requestPayload: OpenAI.ChatCompletionCreateParamsNonStreaming = {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                    { role: 'user', content: `Transform these rows:\n${batchDataStr}` }
                ],
                temperature: 0, // Use zero temperature for deterministic results
                max_tokens: 2000,
            };

            logger.debug('Sending OpenAI request', requestPayload);

            const response = await openai.chat.completions.create(requestPayload);

            const transformedText = response.choices[0].message.content?.trim() || '';

            // Parse the transformed data
            const transformedRows = transformedText
                .split('\n')
                .filter(line => line.trim() !== '')
                .map(line => line.split(',').map(item => item.trim()));

            transformedData.push(...transformedRows);
        }

        return NextResponse.json({ transformedData });
    } catch (error) {
        console.error('Error transforming data:', error);

        return NextResponse.json(
            { error: `Error transforming data: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}