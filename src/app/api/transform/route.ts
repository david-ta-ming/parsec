import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import logger from '@/utils/logger';

// Configuration constants
const CONFIG = {
    MAX_RETRY_ATTEMPTS: 3,
    BATCH_SIZE: 5,
    MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    API_KEY: process.env.OPENAI_API_KEY || ''
};

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: CONFIG.API_KEY
});

// Type definitions for better type safety
interface TransformRequest {
    data: Record<string, string>[];
    headers: string[];
    transformationPrompt: string;
    hasHeaders?: boolean;
    outputFormat?: 'csv' | 'json';
}

interface TransformResponse {
    transformedData: Record<string, string>[] | string[][];
    headers: string[];
}

/**
 * Builds the system prompt for OpenAI
 */
function buildSystemPrompt(transformationPrompt: string): string {
    return `You are a data transformation assistant. Your task is to transform each row of data according to these instructions: "${transformationPrompt}".
Follow these strict rules:
1. Transform the data as per the user's instructions.
2. The input data will be provided as JSON objects where each object represents a row with column headers as keys.
3. Return the transformed data in the same JSON format with column headers as keys.
4. Maintain the same number of columns for each row unless explicitly instructed to add or remove columns.
5. DO NOT add any explanations or comments in your response.
6. Your response must be a valid JSON object with a 'data' field containing an array of transformed row objects.`;
}

/**
 * Builds the user prompt for OpenAI with examples
 */
function buildUserPrompt(headers: string[], exampleRows: Record<string, string>[], hasHeaders: boolean): string {
    const dataStructure = {
        headers,
        exampleRows,
        hasOriginalHeaders: hasHeaders
    };

    let prompt = `Here is the data structure in JSON format:
${JSON.stringify(dataStructure, null, 2)}`;

    if (!hasHeaders) {
        prompt += `\n(Note: The headers were auto-generated because the original file had no headers.)`;
    }

    return prompt;
}

/**
 * Processes a batch of data using OpenAI
 */
async function processBatch(batch: Record<string, string>[], systemPrompt: string, userPrompt: string, batchIndex: number): Promise<Record<string, string>[]> {
    let attempt = 0;

    while (attempt < CONFIG.MAX_RETRY_ATTEMPTS) {
        try {
            const requestPayload: OpenAI.Chat.ChatCompletionCreateParams = {
                model: CONFIG.MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                    { role: 'user', content: `Transform these rows:\n${JSON.stringify(batch, null, 2)}` }
                ],
                temperature: 0, // Use zero temperature for deterministic results
                max_tokens: 16384,
                response_format: { type: "json_object" }
            };

            logger.debug(`Sending batch starting at index ${batchIndex}; size: ${batch.length}`);

            const response = await openai.chat.completions.create(requestPayload);
            const content = response.choices[0].message.content?.trim() || '{}';
            const jsonResponse = JSON.parse(content);

            logger.debug(`Received batch starting at index ${batchIndex}; size: ${jsonResponse.data?.length}`);
            logger.debug(`Usage: ${JSON.stringify(response.usage)}`);

            // Validate the response
            if (!jsonResponse.data || !Array.isArray(jsonResponse.data)) {
                logger.warn(`Attempt ${attempt + 1}: Invalid response format. Retrying...`);
                attempt++;
                continue;
            }

            return jsonResponse.data;
        } catch (error) {
            logger.error(`Batch ${batchIndex} failed on attempt ${attempt + 1}: ${error}`);
            attempt++;
        }
    }

    throw new Error(`Batch ${batchIndex} failed after ${CONFIG.MAX_RETRY_ATTEMPTS} retries.`);
}

/**
 * Formats the transformed results based on the requested output format
 */
function formatResults(transformedResults: Record<string, string>[], outputFormat: 'csv' | 'json', hasHeaders: boolean, originalHeaders: string[]): TransformResponse {
    if (outputFormat === 'json') {
        return {
            transformedData: transformedResults,
            headers: Object.keys(transformedResults[0] || {})
        };
    } else {
        // Extract all unique keys to ensure consistent columns
        const allKeys = new Set<string>();
        transformedResults.forEach(row => {
            Object.keys(row).forEach(key => allKeys.add(key));
        });

        // Use original headers or extract them from result
        const headers = hasHeaders ? originalHeaders : Array.from(allKeys);

        // Convert objects to arrays
        const transformedData = transformedResults.map(row => {
            return headers.map(key => (row[key] || '').toString());
        });

        return { transformedData, headers };
    }
}

/**
 * Handles POST requests to transform data
 */
export async function POST(req: NextRequest) {
    // Verify API key is available
    if (!CONFIG.API_KEY) {
        logger.error("OpenAI API key is missing");
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

    try {
        // Parse request
        const {
            data,
            headers,
            transformationPrompt,
            hasHeaders = true,
            outputFormat = 'csv'
        } = await req.json() as TransformRequest;

        // Validate request data
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

        // Validate JSON format
        const dataIsJson = typeof data[0] === 'object' && !Array.isArray(data[0]);
        if (!dataIsJson) {
            return NextResponse.json(
                { error: 'Invalid JSON data' },
                { status: 400 }
            );
        }

        // Build prompts
        const systemPrompt = buildSystemPrompt(transformationPrompt);
        const exampleRows = data.slice(0, 3);
        const userPrompt = buildUserPrompt(headers, exampleRows, hasHeaders) +
            `\n\nInstructions: ${transformationPrompt}\n\nTransform ALL rows according to the instructions. Return the transformed data as a JSON object where each row is represented as an object with column headers as keys.`;

        // Process data in batches
        const batchPromises: Promise<Record<string, string>[]>[] = [];

        for (let i = 0; i < data.length; i += CONFIG.BATCH_SIZE) {
            const batch = data.slice(i, Math.min(i + CONFIG.BATCH_SIZE, data.length));
            batchPromises.push(processBatch(batch, systemPrompt, userPrompt, i));
        }

        // Wait for all batches to complete
        const batchResults = await Promise.all(batchPromises);
        const transformedResults = batchResults.flat();

        logger.debug(`Transformed results: ${transformedResults.length}`);

        // Format and return results
        const formattedResults = formatResults(transformedResults, outputFormat as 'csv' | 'json', hasHeaders, headers);

        return NextResponse.json(formattedResults);
    } catch (error) {
        logger.error('Error transforming data:', error);
        return NextResponse.json(
            { error: `Error transforming data: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
}