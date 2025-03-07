import * as XLSX from 'xlsx';

export interface FileData {
    headers: string[];
    data: string[][];
    hasHeaders: boolean; // New flag to indicate if the file had original headers
}

export interface ParseOptions {
    hasHeaders?: boolean; // Optional parameter to specify if file has headers
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
            return parseCsv(file, ',', hasHeaders);
        case 'tsv':
            return parseCsv(file, '\t', hasHeaders);
        case 'txt':
            return parseTxt(file, hasHeaders);
        case 'xlsx':
        case 'xls':
            return parseExcel(file, hasHeaders);
        default:
            throw new Error(`Unsupported file type: .${fileExtension}`);
    }
};

// Fix for src/utils/fileParser.ts - Update the parseCsv function

const parseCsv = async (file: File, delimiter: string, hasHeaders: boolean): Promise<FileData> => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

    // Improved CSV parser that properly handles quoted values
    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let inQuotes = false;
        let currentValue = '';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                // Handle escaped quotes (two double quotes in a row)
                if (nextChar === '"') {
                    currentValue += '"';
                    i++; // Skip the next quote
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                // We found a delimiter not inside quotes
                result.push(currentValue);
                currentValue = '';
            } else {
                // Regular character
                currentValue += char;
            }
        }

        // Add the last value
        result.push(currentValue);

        return result;
    };

    if (lines.length === 0) {
        return { headers: [], data: [], hasHeaders };
    }

    let headers: string[] = [];
    let rowData: string[][] = [];

    if (hasHeaders) {
        // If file has headers, use the first line as headers
        headers = parseCSVLine(lines[0]);
        rowData = lines.slice(1).map(line => parseCSVLine(line));
    } else {
        // If file has no headers, generate headers and use all lines as data
        rowData = lines.map(line => parseCSVLine(line));

        // Generate default column headers based on first row
        if (rowData.length > 0) {
            const columnCount = rowData[0].length;
            headers = Array.from({ length: columnCount }, (_, i) => `Column ${i + 1}`);
        }
    }

    return { headers, data: rowData, hasHeaders };
};

const parseTxt = async (file: File, hasHeaders: boolean): Promise<FileData> => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

    // Try to detect the delimiter
    let delimiter = '\t'; // Default to tab
    if (lines.length > 0) {
        const firstLine = lines[0];
        // Check common delimiters
        const delimiters = ['\t', ',', ';', '|'];
        const counts = delimiters.map(d => {
            return {
                delimiter: d,
                count: (firstLine.match(new RegExp(d, 'g')) || []).length
            };
        });

        const bestMatch = counts.reduce((prev, current) =>
            current.count > prev.count ? current : prev, { delimiter: '\t', count: 0 });

        if (bestMatch.count > 0) {
            delimiter = bestMatch.delimiter;
        }
    }

    if (lines.length === 0) {
        return { headers: [], data: [], hasHeaders };
    }

    let headers: string[] = [];
    let rowData: string[][] = [];

    if (hasHeaders) {
        headers = lines[0].split(delimiter);
        rowData = lines.slice(1).map(line => line.split(delimiter));
    } else {
        rowData = lines.map(line => line.split(delimiter));

        // Generate default column headers based on first row
        if (rowData.length > 0) {
            const columnCount = rowData[0].length;
            headers = Array.from({ length: columnCount }, (_, i) => `Column ${i + 1}`);
        }
    }

    return { headers, data: rowData, hasHeaders };
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
                const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

                if (jsonData.length === 0) {
                    resolve({ headers: [], data: [], hasHeaders });
                    return;
                }

                let headers: string[] = [];
                let rowData: string[][] = [];

                if (hasHeaders) {
                    // Extract headers and data
                    headers = (jsonData[0] as any[]).map(h => h?.toString() || '');
                    rowData = jsonData.slice(1).map(row =>
                        (row as any[]).map(cell => cell?.toString() || '')
                    );
                } else {
                    // All rows are data
                    rowData = jsonData.map(row =>
                        (row as any[]).map(cell => cell?.toString() || '')
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