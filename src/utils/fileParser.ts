import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface FileData {
    headers: string[];
    data: string[][];
    hasHeaders: boolean;
}

export interface ParseOptions {
    hasHeaders?: boolean;
}

export const parseFile = async (file: File, options?: ParseOptions): Promise<FileData> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension) {
        throw new Error('Unable to determine file type');
    }

    // Default assumption is that files have headers unless specified otherwise
    const hasHeaders = options?.hasHeaders !== undefined ? options.hasHeaders : true;

    switch (fileExtension) {
        case 'csv':
        case 'tsv':
        case 'txt':
            return parseTextFile(file, hasHeaders, fileExtension);
        case 'xlsx':
        case 'xls':
            return parseExcel(file, hasHeaders);
        case 'json':
            return parseJson(file, hasHeaders);
        default:
            throw new Error(`Unsupported file type: .${fileExtension}`);
    }
};

const parseTextFile = async (file: File, hasHeaders: boolean, fileType: string): Promise<FileData> => {
    const text = await file.text();

    // Configure Papa Parse based on file type
    const config: Papa.ParseConfig = {
        header: false, // We'll handle headers separately
        skipEmptyLines: true,
        // For TSV files, set the delimiter to tab
        delimiter: fileType === 'tsv' ? '\t' : undefined, // Auto-detect for CSV and TXT
    };

    const results = Papa.parse(text, config);

    if (results.errors.length > 0) {
        console.warn('Parse warnings:', results.errors);
    }

    if (!results.data || results.data.length === 0) {
        return { headers: [], data: [], hasHeaders };
    }

    // Convert all values to strings
    const stringData = results.data.map(row =>
        (row as unknown[]).map(cell => cell?.toString() || '')
    );

    let headers: string[] = [];
    let data: string[][];

    if (hasHeaders && stringData.length > 0) {
        // Use first row as headers
        headers = stringData[0];
        data = stringData.slice(1);
    } else {
        data = stringData;
        // Generate default column headers
        if (data.length > 0) {
            const columnCount = data[0].length;
            headers = Array.from({ length: columnCount }, (_, i) => `Column ${i + 1}`);
        }
    }

    return { headers, data, hasHeaders };
};

const parseExcel = async (file: File, hasHeaders: boolean): Promise<FileData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const fileBuffer = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(fileBuffer, { type: 'array' });

                // Get the first worksheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json<unknown>(worksheet, { header: 1 });

                if (jsonData.length === 0) {
                    resolve({ headers: [], data: [], hasHeaders });
                    return;
                }

                let headers: string[] = [];
                let rowData: string[][];

                if (hasHeaders) {
                    // Extract headers and data
                    headers = (jsonData[0] as unknown[]).map(h => h?.toString() || '');
                    rowData = jsonData.slice(1).map(row =>
                        (row as unknown[]).map(cell => cell?.toString() || '')
                    );
                } else {
                    // All rows are data
                    rowData = jsonData.map(row =>
                        (row as unknown[]).map(cell => cell?.toString() || '')
                    );

                    // Generate default column headers based on first row
                    if (rowData.length > 0) {
                        const columnCount = rowData[0].length;
                        headers = Array.from({ length: columnCount }, (_, i) => `Column ${i + 1}`);
                    }
                }

                resolve({ headers, data: rowData, hasHeaders });
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read Excel file'));
        };

        reader.readAsArrayBuffer(file);
    });
};

const parseJson = async (file: File, hasHeaders: boolean): Promise<FileData> => {
    try {
        const text = await file.text();
        const jsonData = JSON.parse(text);

        // Check if the JSON is an array
        if (!Array.isArray(jsonData)) {
            throw new Error('JSON file must contain an array of objects');
        }

        if (jsonData.length === 0) {
            return { headers: [], data: [], hasHeaders };
        }

        // Check if array elements are objects (typical JSON data format)
        if (typeof jsonData[0] === 'object' && jsonData[0] !== null && !Array.isArray(jsonData[0])) {
            // Array of objects - typical JSON data format

            // Get all possible keys from all objects to ensure we capture all possible headers
            const allKeys = new Set<string>();
            jsonData.forEach((item) => {
                if (item && typeof item === 'object') {
                    Object.keys(item).forEach((key) => allKeys.add(key));
                }
            });

            const headers = Array.from(allKeys);

            // Convert objects to arrays of values in header order
            const data = jsonData.map((row) => {
                if (!row || typeof row !== 'object') {
                    // Handle non-object entries by filling with empty strings
                    return headers.map(() => '');
                }

                return headers.map((key) => {
                    const value = (row as Record<string, unknown>)[key];
                    // Convert complex objects/arrays to JSON strings
                    if (value && typeof value === 'object') {
                        return JSON.stringify(value);
                    }
                    return value?.toString() || '';
                });
            });

            return { headers, data, hasHeaders: true }; // JSON objects always have implicit headers
        } else {
            // Handle array of arrays (less common for JSON but possible)
            // Assume first row as headers if hasHeaders is true
            let headers: string[] = [];
            let data: string[][];

            // Convert all values to strings
            const stringData = jsonData.map((row: unknown) => {
                if (Array.isArray(row)) {
                    return row.map((cell) => {
                        if (cell && typeof cell === 'object') {
                            return JSON.stringify(cell);
                        }
                        return cell?.toString() || '';
                    });
                }
                // Handle non-array row (convert single value to array)
                return [row?.toString() || ''];
            });

            if (hasHeaders && stringData.length > 0) {
                headers = stringData[0];
                data = stringData.slice(1);
            } else {
                data = stringData;
                // Generate default column headers
                if (data.length > 0) {
                    const columnCount = data[0].length;
                    headers = Array.from({ length: columnCount }, (_, i) => `Column ${i + 1}`);
                }
            }

            return { headers, data, hasHeaders };
        }
    } catch (error) {
        throw new Error(`Failed to parse JSON file: ${error instanceof Error ? error.message : String(error)}`);
    }
};

/**
 * Converts array data to structured JSON objects with column headers as keys
 */
export const convertArrayToJsonObjects = (data: string[][], headers: string[]): Record<string, string>[] => {
    return data.map(row => {
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
            if (index < row.length) {
                obj[header] = row[index];
            } else {
                obj[header] = '';
            }
        });
        return obj;
    });
};

/**
 * Converts structured JSON objects to array data
 */
export const convertJsonObjectsToArray = (
    jsonObjects: Record<string, string>[],
    headers: string[]
): string[][] => {
    return jsonObjects.map(obj => {
        return headers.map(header => obj[header] || '');
    });
};