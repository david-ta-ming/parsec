// Updated POST function for src/app/api/transform/route.ts

import { NextRequest, NextResponse } from 'next/server';
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
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

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

        // Build the prompt for OpenAI with explicit instructions about CSV formatting
        const systemPrompt = `You are a data transformation assistant. Your task is to transform each row of data according to these instructions: "${transformationPrompt}".
Follow these strict rules:
1. Provide ONLY the transformed data values without any explanations.
2. Maintain the same number of columns for each row.
3. For data containing commas (like "First, Last" name format), enclose the ENTIRE value in double quotes like "First, Last".
4. For any value containing double quotes, escape them by doubling them and enclose the entire value in quotes.
5. Format your response as one complete row per line, with values separated by commas.
6. DO NOT add any heading, footer, or explanatory text.`;

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

IMPORTANT: If your transformation results in values containing commas (such as "Smith, John"), you MUST enclose the ENTIRE value in double quotes like "Smith, John". This is crucial for proper CSV formatting.

Transform ALL rows according to the instructions. Return ONLY the transformed data as comma-separated values, one row per line. Preserve all columns.`;

        // Process data in batches to avoid token limits
        const batchSize = 10;
        const transformedData: string[][] = [];

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, Math.min(i + batchSize, data.length));
            const batchDataStr = batch.map(row => row.join(',')).join('\n');

            const requestPayload: OpenAI.Chat.ChatCompletionCreateParams = {
                model: MODEL,
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

            logger.debug('Received OpenAI response', response.choices[0]);

            const transformedText = response.choices[0].message.content?.trim() || '';

            // Custom CSV parsing that respects quoted values
            const rows = parseCSV(transformedText);
            transformedData.push(...rows);
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

// Custom CSV parser
function parseCSV(csvText: string): string[][] {
    const rows: string[][] = [];
    const lines = csvText.split('\n').filter(line => line.trim());

    for (const line of lines) {
        const row: string[] = [];
        let inQuotes = false;
        let currentValue = '';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = i < line.length - 1 ? line[i + 1] : null;

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote inside quotes
                    currentValue += '"';
                    i++; // Skip the next quote
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of value
                row.push(currentValue);
                currentValue = '';
            } else {
                // Normal character
                currentValue += char;
            }
        }

        // Add the last value
        row.push(currentValue);
        rows.push(row);
    }

    return rows;
}