import * as XLSX from 'xlsx';

export interface FileData {
    headers: string[];
    data: string[][];
}

export const parseFile = async (file: File): Promise<FileData> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension) {
        throw new Error('Unable to determine file type');
    }

    switch (fileExtension) {
        case 'csv':
            return parseCsv(file, ',');
        case 'tsv':
            return parseCsv(file, '\t');
        case 'txt':
            return parseTxt(file);
        case 'xlsx':
        case 'xls':
            return parseExcel(file);
        default:
            throw new Error(`Unsupported file type: .${fileExtension}`);
    }
};

const parseCsv = async (file: File, delimiter: string): Promise<FileData> => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');

    // CSV can have quoted values containing delimiters
    // This is a simple parser that might not handle all CSV edge cases
    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let inQuotes = false;
        let currentValue = '';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
                result.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }

        // Add the last value
        result.push(currentValue);

        return result;
    };

    if (lines.length === 0) {
        return { headers: [], data: [] };
    }

    const headers = parseCSVLine(lines[0]);
    const rowData = lines.slice(1).map(line => parseCSVLine(line));

    return { headers, data: rowData };
};

const parseTxt = async (file: File): Promise<FileData> => {
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
        return { headers: [], data: [] };
    }

    const headers = lines[0].split(delimiter);
    const rowData = lines.slice(1).map(line => line.split(delimiter));

    return { headers, data: rowData };
};

const parseExcel = async (file: File): Promise<FileData> => {
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
                    resolve({ headers: [], data: [] });
                    return;
                }

                // Extract headers and data
                const headers = (jsonData[0] as any[]).map(h => h?.toString() || '');
                const rowData = jsonData.slice(1).map(row =>
                    (row as any[]).map(cell => cell?.toString() || '')
                );

                resolve({ headers, data: rowData });
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