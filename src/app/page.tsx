'use client';

import {useState} from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Button,
    TextField,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import TableViewIcon from '@mui/icons-material/TableView';
import GridOnIcon from '@mui/icons-material/GridOn';
import CodeIcon from '@mui/icons-material/Code';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FileUpload from '@/components/FileUpload';
import TransformationPreview from '@/components/TransformationPreview';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {parseFile, FileData} from '@/utils/fileParser';
import {
    convertArrayToJsonObjects,
    convertJsonObjectsToArray,
    extractHeadersFromJsonObjects
} from '@/utils/fileParser';

// Interface for the tabs
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{pt: 2}}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function Home() {
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [, setFileType] = useState<string>('');
    const [transformationPrompt, setTransformationPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState<number>(0);
    const [isTransformingFullData, setIsTransformingFullData] = useState<boolean>(false);
    const [transformedData, setTransformedData] = useState<string[][]>([]);
    const [transformedJsonData, setTransformedJsonData] = useState<Record<string, string>[]>([]);
    const [outputFormat, setOutputFormat] = useState<'csv' | 'tsv' | 'json' | 'excel'>('csv');

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleFileUpload = async (file: File, hasHeaders: boolean) => {
        try {
            setIsLoading(true);
            setError(null);
            setFileName(file.name);
            setFileType(file.type);
            setTransformedData([]); // Reset transformed data when a new file is uploaded

            const data = await parseFile(file, {hasHeaders});
            setFileData(data);

            // Show the original data tab after successful upload
            setTabValue(0);
        } catch (err) {
            setError(`Error parsing file: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTransform = async () => {
        if (!fileData || !transformationPrompt.trim()) {
            setError('Please upload a file and provide transformation instructions');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Only send a sample of the data for transformation
            const sample = fileData.data.slice(0, Math.min(10, fileData.data.length));

            const response = await fetch('/api/transform', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: sample,
                    headers: fileData.headers,
                    transformationPrompt,
                    hasHeaders: fileData.hasHeaders,
                    outputFormat // Include the desired output format
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const result = await response.json();

            if (outputFormat === 'json') {
                // Handle JSON format
                setTransformedJsonData(result.transformedData);
                // Also convert to array format for display compatibility
                setTransformedData(convertJsonObjectsToArray(
                    result.transformedData,
                    result.headers || fileData.headers
                ));
            } else {
                // Handle CSV/TSV/Excel formats (array-based)
                setTransformedData(result.transformedData);
                // Also convert to JSON objects for potential JSON download
                setTransformedJsonData(convertArrayToJsonObjects(
                    result.transformedData,
                    fileData.headers
                ));
            }

            // Switch to the transformed data tab after transformation
            setTabValue(1);
        } catch (err) {
            setError(`Error transforming data: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoading(false);
        }
    };

// Update the transformAllData function similarly
    const transformAllData = async (): Promise<string[][]> => {
        if (!fileData || !transformationPrompt.trim()) {
            setError('Please upload a file and provide transformation instructions');
            throw new Error('Missing file data or transformation prompt');
        }

        try {
            setIsTransformingFullData(true);
            setError(null);

            // Process data in batches to avoid timeout
            const batchSize = 100;
            let allTransformedRows: string[][] = [];
            let allTransformedJsonRows: Record<string, string>[] = [];

            for (let i = 0; i < fileData.data.length; i += batchSize) {
                const batch = fileData.data.slice(i, i + batchSize);

                const response = await fetch('/api/transform', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        data: batch,
                        headers: fileData.headers,
                        transformationPrompt,
                        hasHeaders: fileData.hasHeaders,
                        outputFormat
                    }),
                });

                if (!response.ok) {
                    throw new Error(`API error: ${response.statusText}`);
                }

                const result = await response.json();

                if (outputFormat === 'json') {
                    // Handle JSON format
                    allTransformedJsonRows = [...allTransformedJsonRows, ...result.transformedData];
                    // Also convert for array compatibility
                    const arrayData = convertJsonObjectsToArray(
                        result.transformedData,
                        result.headers || fileData.headers
                    );
                    allTransformedRows = [...allTransformedRows, ...arrayData];
                } else {
                    // Handle CSV/TSV/Excel formats (array-based)
                    allTransformedRows = [...allTransformedRows, ...result.transformedData];
                    // Also convert to JSON objects
                    const jsonData = convertArrayToJsonObjects(
                        result.transformedData,
                        fileData.headers
                    );
                    allTransformedJsonRows = [...allTransformedJsonRows, ...jsonData];
                }
            }

            // Update the state with all transformed data
            setTransformedData(allTransformedRows);
            setTransformedJsonData(allTransformedJsonRows);

            return allTransformedRows;
        } catch (err) {
            setError(`Error transforming data: ${err instanceof Error ? err.message : String(err)}`);
            throw err;
        } finally {
            setIsTransformingFullData(false);
        }
    };

    const handleDownload = async (format: 'csv' | 'tsv' | 'json' | 'excel' = 'csv') => {
        if (!fileData) return;

        try {
            setIsLoading(true);

            // First transform all data if needed
            const dataToDownload = await transformAllData();

            let content: string | Blob;
            let mimeType: string;
            let outputExtension: string = format;

            switch (format) {
                case 'csv':
                    // For CSV files, we need to handle quoted values properly
                    let csvContent = '';

                    // Add headers if the original file had them
                    if (fileData.hasHeaders) {
                        const headerLine = fileData.headers.map(header => {
                            // Check if header contains characters that need quoting
                            if (header.includes(',') || header.includes('"') || header.includes('\n')) {
                                return `"${header.replace(/"/g, '""')}"`;
                            }
                            return header;
                        }).join(',');
                        csvContent += headerLine + '\n';
                    }

                    // Add the data rows
                    csvContent += dataToDownload.map(row => {
                        return row.map(value => {
                            // Quote values containing commas, quotes, or newlines
                            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                                return `"${value.replace(/"/g, '""')}"`;
                            }
                            return value;
                        }).join(',');
                    }).join('\n');

                    content = csvContent;
                    mimeType = 'text/csv';
                    break;

                case 'tsv':
                    // For TSV, replace tabs in values with spaces to avoid delimiter confusion
                    let tsvContent = '';

                    // Add headers if the original file had them
                    if (fileData.hasHeaders) {
                        const headerLine = fileData.headers.map(header =>
                            header.replace(/\t/g, ' ')
                        ).join('\t');
                        tsvContent += headerLine + '\n';
                    }

                    // Add the data rows
                    tsvContent += dataToDownload.map(row => {
                        return row.map(value => value.replace(/\t/g, ' ')).join('\t');
                    }).join('\n');

                    content = tsvContent;
                    mimeType = 'text/tab-separated-values';
                    break;

                case 'json':
                    // Create JSON with headers as keys if original file had headers
                    let jsonData;
                    if (fileData.hasHeaders) {
                        jsonData = dataToDownload.map(row => {
                            const rowObj: Record<string, string> = {};
                            fileData.headers.forEach((header, index) => {
                                if (index < row.length) {
                                    rowObj[header] = row[index];
                                } else {
                                    rowObj[header] = '';
                                }
                            });
                            return rowObj;
                        });
                    } else {
                        jsonData = dataToDownload;
                    }
                    content = JSON.stringify(jsonData, null, 2);
                    mimeType = 'application/json';
                    break;

                case 'excel':
                    // Create Excel file using the xlsx library
                    import('xlsx').then(XLSX => {
                        // Create a new workbook
                        const wb = XLSX.utils.book_new();

                        // Add data with or without headers
                        const excelData = fileData.hasHeaders
                            ? [fileData.headers, ...dataToDownload]
                            : dataToDownload;

                        // Create a worksheet from the data
                        const ws = XLSX.utils.aoa_to_sheet(excelData);

                        // Add the worksheet to the workbook
                        XLSX.utils.book_append_sheet(wb, ws, "Transformed Data");

                        // Generate Excel file
                        const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});

                        // Create a Blob from the buffer
                        const blob = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});

                        // Create a filename with the xlsx extension
                        const baseName = fileName.split('.')[0] || 'transformed_data';
                        const excelFilename = `${baseName}_transformed.xlsx`;

                        // Trigger download
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = excelFilename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        setIsLoading(false);
                    });
                    return; // Early return since Excel handling is async

                default:
                    // Fallback to CSV
                    content = dataToDownload.map(row => row.join(',')).join('\n');
                    mimeType = 'text/csv';
                    outputExtension = 'csv';
            }

            // Create a filename with the new extension
            const baseName = fileName.split('.')[0] || 'transformed_data';
            const outputFilename = `${baseName}_transformed.${outputExtension}`;

            // For non-Excel formats (which return early)
            const blob = new Blob([content as string], {type: mimeType});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = outputFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(`Error downloading file: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Create a data preview component using Material UI components
    const DataPreview = ({data, headers, hasHeaders}: { data: string[][], headers: string[], hasHeaders: boolean }) => {
        // Display at most 10 rows to prevent UI lag
        const displayRowCount = Math.min(10, data.length);
        const displayData = data.slice(0, displayRowCount);

        return (
            <Box sx={{mb: 4}}>
                <Typography variant="h6" gutterBottom>
                    Data Preview
                </Typography>
                <TableContainer component={Paper} sx={{maxHeight: 400}}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                {headers.map((header, index) => (
                                    <TableCell key={index}>
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayData.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    <TableCell>{rowIndex + 1}</TableCell>
                                    {row.map((cell, cellIndex) => (
                                        <TableCell key={cellIndex}>{cell}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {data.length > displayRowCount && (
                    <Typography variant="body2" sx={{mt: 2, fontStyle: 'italic'}}>
                        Showing {displayRowCount} of {data.length} rows.
                    </Typography>
                )}

                {!hasHeaders && (
                    <Typography variant="body2" sx={{mt: 2, fontStyle: 'italic', color: 'text.secondary'}}>
                        Note: Column headers were automatically generated since the original file did not have headers.
                    </Typography>
                )}
            </Box>
        );
    };
    return (
        <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
            <Header/>
            <Container maxWidth="lg" sx={{mt: 4, mb: 4, flex: '1 0 auto'}}>
                <Paper sx={{p: 3, mb: 4}}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Transform Data with AI
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Upload your data file and describe how you want it transformed. Parsec will use AI to process
                        your data according to your instructions.
                    </Typography>

                    <FileUpload onFileUpload={handleFileUpload}/>

                    {error && (
                        <Alert severity="error" sx={{mt: 2}}>
                            {error}
                        </Alert>
                    )}

                    {fileData && (
                        <Box sx={{mt: 3}}>
                            <Typography variant="h6">
                                File: {fileName}
                            </Typography>
                            <Typography variant="body2" sx={{mb: 2}}>
                                {fileData.data.length} rows of data {!fileData.hasHeaders && '(no headers detected)'}
                            </Typography>

                            <TextField
                                fullWidth
                                label="Describe your transformation"
                                multiline
                                rows={3}
                                value={transformationPrompt}
                                onChange={(e) => setTransformationPrompt(e.target.value)}
                                placeholder="Example: Convert dates from MM/DD/YYYY to YYYY-MM-DD format, capitalize all names, and format phone numbers as (XXX) XXX-XXXX"
                                sx={{mb: 2}}
                            />

                            {isTransformingFullData && (
                                <Alert severity="info" sx={{mt: 2, mb: 2}}>
                                    Transforming all data. This may take a moment for larger datasets...
                                </Alert>
                            )}

                            <Box sx={{display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap'}}>
                                {fileData && (
                                    <Button
                                        variant="contained"
                                        onClick={handleTransform}
                                        disabled={isLoading || !transformationPrompt.trim()}
                                    >
                                        Preview Transformation
                                    </Button>
                                )}

                                {transformedData.length > 0 && (
                                    <Box sx={{display: 'flex', gap: 1}}>
                                        <Typography variant="body2" sx={{mr: 1, alignSelf: 'center'}}>
                                            Download as:
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleDownload('csv')}
                                            title="Download as CSV file"
                                            size="small"
                                            endIcon={<TableViewIcon/>}
                                            disabled={isLoading}
                                            sx={{minWidth: '100px', width: '100px'}}
                                        >
                                            CSV
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleDownload('tsv')}
                                            title="Download as TSV file"
                                            size="small"
                                            endIcon={<GridOnIcon/>}
                                            disabled={isLoading}
                                            sx={{minWidth: '100px', width: '100px'}}
                                        >
                                            TSV
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleDownload('json')}
                                            title="Download as JSON file"
                                            size="small"
                                            endIcon={<CodeIcon/>}
                                            disabled={isLoading}
                                            sx={{minWidth: '100px', width: '100px'}}
                                        >
                                            JSON
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleDownload('excel')}
                                            title="Download as Excel file"
                                            size="small"
                                            endIcon={<InsertDriveFileIcon/>}
                                            disabled={isLoading}
                                            sx={{minWidth: '100px', width: '100px'}}
                                        >
                                            Excel
                                        </Button>
                                    </Box>
                                )}
                            </Box>

                            {isLoading && (
                                <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                                    <CircularProgress/>
                                </Box>
                            )}

                            {fileData && !isLoading && (
                                <Box sx={{width: '100%'}}>
                                    <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                                        <Tabs value={tabValue} onChange={handleTabChange}
                                              aria-label="data preview tabs">
                                            <Tab label="Original Data"/>
                                            {transformedData.length > 0 && <Tab label="Transformed Data"/>}
                                        </Tabs>
                                    </Box>
                                    <TabPanel value={tabValue} index={0}>
                                        <DataPreview
                                            data={fileData.data}
                                            headers={fileData.headers}
                                            hasHeaders={fileData.hasHeaders}
                                        />
                                    </TabPanel>
                                    {transformedData.length > 0 && (
                                        <TabPanel value={tabValue} index={1}>
                                            <TransformationPreview
                                                originalData={fileData}
                                                transformedData={transformedData}
                                            />
                                        </TabPanel>
                                    )}
                                </Box>
                            )}
                        </Box>
                    )}
                </Paper>
            </Container>
            <Footer/>
        </Box>
    );
}