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
    return `Transform each row of data according to: "${transformationPrompt}".
Rules:
1. Input: JSON objects with column headers as keys
2. Output: Same JSON format with headers as keys 
3. Maintain column count unless instructed otherwise
4. Return only valid JSON with a 'data' field containing transformed row objects
5. No explanations or comments`;
}

/**
 * Builds the user prompt for OpenAI
 */
function buildUserPrompt(headers: string[], hasHeaders: boolean): string {
    return `Headers: ${JSON.stringify(headers)}
${!hasHeaders ? '(Note: Headers were auto-generated)' : ''}
Transform the following rows as JSON objects:`;
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
                    { role: 'user', content: userPrompt + `\n${JSON.stringify(batch, null, 2)}` }
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
        const userPrompt = buildUserPrompt(headers, hasHeaders);

        logger.debug(`systemPrompt: \n${systemPrompt}`);
        logger.debug(`userPrompt: \n${userPrompt}`);

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