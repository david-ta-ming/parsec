'use client';

import {useState, useRef} from 'react';
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
import TransformationProgressModal from '@/components/TransformationProgressModal';
import {parseFile, FileData} from '@/utils/fileParser';
import {
    convertArrayToJsonObjects,
    convertJsonObjectsToArray
} from '@/utils/fileParser';
import Papa from "papaparse";

// Process data in batches to avoid timeout
const BATCH_SIZE: number = 15;
const MAX_RETRIES: number = 3;

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

// Utility function for API requests with retry logic
const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    retryDelay: number = 1000
): Promise<Response> => {
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            const response = await fetch(url, options);

            // If the request was successful, return the response
            if (response.ok) {
                return response;
            }

            // If we got a 429 (Too Many Requests), 504 (Gateway Timeout), or other 5xx error, retry
            if (response.status === 429 || response.status === 504 || response.status >= 500) {
                retries++;
                console.warn(`Request failed with status ${response.status}. Retry ${retries}/${MAX_RETRIES}`);

                // Wait before retrying (with exponential backoff)
                await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retries - 1)));
                continue;
            }

            // For other error status codes, don't retry
            return response;
        } catch (error) {

            // Check if this is an AbortError (user cancelled)
            if (error instanceof Error && error.name === 'AbortError') {
                // Don't retry aborted requests, just propagate the abort
                throw error;
            }

            // For network errors, retry
            retries++;
            console.warn(`Network error: ${error instanceof Error ? error.message : String(error)}. Retry ${retries}/${MAX_RETRIES}`);

            // If we've reached the max retries, throw the error
            if (retries >= MAX_RETRIES) {
                throw error;
            }

            // Wait before retrying (with exponential backoff)
            await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retries - 1)));
        }
    }

    // This should not be reached, but TypeScript requires a return statement
    throw new Error('Maximum retries reached');
};

export default function Home() {
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [, setFileType] = useState<string>('');
    const [transformationPrompt, setTransformationPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [tabValue, setTabValue] = useState<number>(0);
    const [isTransformingFullData, setIsTransformingFullData] = useState<boolean>(false);
    const [transformedData, setTransformedData] = useState<Record<string, string>[]>([]);
    const [transformProgress, setTransformProgress] = useState<number>(0);
    const [isCancelling, setIsCancelling] = useState<boolean>(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [processedRows, setProcessedRows] = useState<number>(0);

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

    const handleCancelTransformation = () => {
        setIsCancelling(true);

        // Abort any ongoing fetch requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Clean up state after a short delay to show cancellation is in progress
        setTimeout(() => {
            setIsTransformingFullData(false);
            setTransformProgress(0);
            setProcessedRows(0);
            setIsCancelling(false);
            setError(null);
        }, 500);
    };

    const handlePreviewTransform = async () => {
        if (!fileData || !transformationPrompt.trim()) {
            setError('Please upload a file and provide transformation instructions');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Only send a sample of the data for transformation
            const sample = fileData.data.slice(0, Math.min(10, fileData.data.length));

            // Convert sample data to JSON objects before sending to API
            const sampleObjects = convertArrayToJsonObjects(sample, fileData.headers);

            // Use the fetchWithRetry function instead of fetch
            const response = await fetchWithRetry(
                '/api/transform',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        data: sampleObjects,
                        headers: fileData.headers,
                        transformationPrompt,
                        hasHeaders: fileData.hasHeaders,
                        outputFormat: 'json' // Always request JSON from the API
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const result = await response.json();

            // Store the transformed data in our standard format
            setTransformedData(result.transformedData);

            // Switch to the transformed data tab after transformation
            setTabValue(1);
        } catch (err) {
            setError(`Error transforming data: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoading(false);
        }
    };

    const transformAllData = async (): Promise<Record<string, string>[]> => {
        if (!fileData || !transformationPrompt.trim()) {
            setError('Please upload a file and provide transformation instructions');
            throw new Error('Missing file data or transformation prompt');
        }

        try {
            // Create a new AbortController for this operation
            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;

            // Set initial states
            setIsTransformingFullData(true);
            setTransformProgress(0);
            setProcessedRows(0);
            setError(null);

            let allTransformedRows: Record<string, string>[] = [];
            const totalBatches = Math.ceil(fileData.data.length / BATCH_SIZE);

            // Create a timeout to give immediate feedback to the user
            await new Promise(resolve => setTimeout(resolve, 300));

            for (let i = 0; i < fileData.data.length; i += BATCH_SIZE) {
                // Check if operation was cancelled
                if (signal.aborted) {
                    throw new Error('Operation cancelled by user');
                }

                const batch = fileData.data.slice(i, i + BATCH_SIZE);
                const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

                // Convert batch to JSON objects
                const batchObjects = convertArrayToJsonObjects(batch, fileData.headers);

                // Calculate the number of rows processed so far
                // Use Math.min to ensure we don't show more than the total number of rows
                const rowsProcessed = Math.min((i + BATCH_SIZE), fileData.data.length);
                setProcessedRows(rowsProcessed);

                // Use the fetchWithRetry function with the abort signal
                const response = await fetchWithRetry(
                    '/api/transform',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            data: batchObjects,
                            headers: fileData.headers,
                            transformationPrompt,
                            hasHeaders: fileData.hasHeaders,
                            outputFormat: 'json' // Always request JSON from the API
                        }),
                        signal, // Pass the abort signal to fetch
                    }
                );

                if (!response.ok) {
                    throw new Error(`API error: ${response.statusText}`);
                }

                const result = await response.json();

                allTransformedRows = [...allTransformedRows, ...result.transformedData];

                // Update progress and processed rows
                const progressPercentage = Math.round((currentBatch / totalBatches) * 100);
                setTransformProgress(progressPercentage);
            }

            // Add a small delay to show the 100% state before completion
            await new Promise(resolve => setTimeout(resolve, 500));

            // Update the state with all transformed data
            setTransformedData(allTransformedRows);
            return allTransformedRows;
        } catch (err) {
            // Handle aborted operation differently from other errors
            if (err instanceof Error && err.name === 'AbortError') {
                console.log('Operation cancelled by user');
                return []; // Return empty array instead of throwing
            } else {
                setError(`Error transforming data: ${err instanceof Error ? err.message : String(err)}`);
                throw err;
            }
        } finally {
            // Clean up regardless of outcome
            if (!isCancelling) {
                setIsTransformingFullData(false);
                setTransformProgress(0);
                setProcessedRows(0);
            }
            abortControllerRef.current = null;
        }
    };

    const handleDownload = async (format: 'csv' | 'tsv' | 'json' | 'excel' = 'csv') => {
        if (!fileData) return;

        try {
            setIsLoading(true);

            // Get the full transformed data
            let dataToDownload: Record<string, string>[];

            // Check if we're using the preview data or need to transform all data
            if (transformedData.length === fileData.data.length) {
                // If we've already transformed all data, use that
                dataToDownload = transformedData;
            } else {
                // Otherwise, transform all data now
                dataToDownload = await transformAllData();

                // If dataToDownload is empty, the transformation was cancelled
                if (dataToDownload.length === 0) {
                    setIsLoading(false);
                    return; // Exit early
                }
            }

            // Get all unique column keys from transformed data
            const transformedHeaders = dataToDownload.length > 0
                ? Object.keys(dataToDownload[0])
                : fileData.headers;

            let content: string | Blob;
            let mimeType: string;
            let outputExtension: string = format;

            switch (format) {
                case 'csv':
                case 'tsv':
                    // Convert JSON objects to arrays for CSV/TSV output
                    const dataArray = convertJsonObjectsToArray(dataToDownload, transformedHeaders);

                    // Use Papa Parse to generate CSV/TSV
                    const config: Papa.UnparseConfig = {
                        delimiter: format === 'tsv' ? '\t' : ',',
                        header: true,
                        quotes: true,
                    };

                    // Create array with headers as first row
                    const dataWithHeaders = [transformedHeaders, ...dataArray];

                    content = Papa.unparse(dataWithHeaders, config);
                    mimeType = format === 'csv' ? 'text/csv' : 'text/tab-separated-values';
                    break;

                case 'json':
                    // Use JSON objects directly
                    content = JSON.stringify(dataToDownload, null, 2);
                    mimeType = 'application/json';
                    break;

                case 'excel':
                    // Convert JSON objects to arrays for Excel output
                    const excelDataArray = convertJsonObjectsToArray(dataToDownload, transformedHeaders);

                    // Create Excel file using the xlsx library
                    import('xlsx').then(XLSX => {
                        // Create a new workbook
                        const wb = XLSX.utils.book_new();

                        // Add data with headers
                        const excelData = [transformedHeaders, ...excelDataArray];

                        // Create a worksheet from the data
                        const ws = XLSX.utils.aoa_to_sheet(excelData);

                        // Add the worksheet to the workbook
                        XLSX.utils.book_append_sheet(wb, ws, "Transformed Data");

                        // Generate Excel file
                        const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});

                        // Create a Blob from the buffer
                        const blob = new Blob([excelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});

                        // Trigger download
                        downloadFile(blob, `${fileName.split('.')[0] || 'transformed_data'}_transformed.xlsx`);
                        setIsLoading(false);
                    });
                    return; // Early return since Excel handling is async

                default:
                    // Fallback to CSV
                    const fallbackArray = convertJsonObjectsToArray(dataToDownload, transformedHeaders);
                    content = Papa.unparse(fallbackArray);
                    mimeType = 'text/csv';
                    outputExtension = 'csv';
            }

            // Create a filename with the new extension
            const baseName = fileName.split('.')[0] || 'transformed_data';
            const outputFilename = `${baseName}_transformed.${outputExtension}`;

            // For non-Excel formats (which return early)
            const blob = new Blob([content as string], {type: mimeType});
            downloadFile(blob, outputFilename);
        } catch (err) {
            setError(`Error downloading file: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadFile = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: '1 0 auto' }}>
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Transform Data with AI
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Upload your data file and describe how you want it transformed. Parsec will use AI to process
                        your data according to your instructions.
                    </Typography>

                    <FileUpload onFileUpload={handleFileUpload} />

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {fileData && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6">
                                File: {fileName}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
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
                                sx={{ mb: 2 }}
                            />

                            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                {fileData && (
                                    <Button
                                        variant="contained"
                                        onClick={handlePreviewTransform}
                                        disabled={isLoading || !transformationPrompt.trim() || isTransformingFullData}
                                    >
                                        Preview Transformation
                                    </Button>
                                )}

                                {transformedData.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                                        <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
                                            Download as:
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleDownload('csv')}
                                            title="Download as CSV file"
                                            size="small"
                                            endIcon={<TableViewIcon />}
                                            disabled={isLoading || isTransformingFullData}
                                            sx={{ minWidth: '100px', width: '100px' }}
                                        >
                                            CSV
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleDownload('tsv')}
                                            title="Download as TSV file"
                                            size="small"
                                            endIcon={<GridOnIcon />}
                                            disabled={isLoading || isTransformingFullData}
                                            sx={{ minWidth: '100px', width: '100px' }}
                                        >
                                            TSV
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleDownload('json')}
                                            title="Download as JSON file"
                                            size="small"
                                            endIcon={<CodeIcon />}
                                            disabled={isLoading || isTransformingFullData}
                                            sx={{ minWidth: '100px', width: '100px' }}
                                        >
                                            JSON
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleDownload('excel')}
                                            title="Download as Excel file"
                                            size="small"
                                            endIcon={<InsertDriveFileIcon />}
                                            disabled={isLoading || isTransformingFullData}
                                            sx={{ minWidth: '100px', width: '100px' }}
                                        >
                                            Excel
                                        </Button>
                                    </Box>
                                )}
                            </Box>

                            {/* Display loading indicator for non-transformation operations */}
                            {isLoading && !isTransformingFullData && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                    <CircularProgress />
                                </Box>
                            )}

                            {fileData && !isLoading && (
                                <Box sx={{ width: '100%' }}>
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                        <Tabs value={tabValue} onChange={handleTabChange}
                                              aria-label="data preview tabs">
                                            <Tab label="Original Data" />
                                            {transformedData.length > 0 && <Tab label="Transformed Data" />}
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
            <Footer />

            {/* Transformation progress modal */}
            <TransformationProgressModal
                isOpen={isTransformingFullData}
                progress={transformProgress}
                processedRows={processedRows}
                totalRows={fileData?.data.length || 0}
                onCancel={handleCancelTransformation}
                isCancelling={isCancelling}
            />
        </Box>
    );
}