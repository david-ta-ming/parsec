'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TableViewIcon from '@mui/icons-material/TableView';
import GridOnIcon from '@mui/icons-material/GridOn';
import CodeIcon from '@mui/icons-material/Code';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FileUpload from '@/components/FileUpload';
import TransformationPreview from '@/components/TransformationPreview';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { parseFile, FileData } from '@/utils/fileParser';

export default function Home() {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [transformedData, setTransformedData] = useState<string[][]>([]);
  const [transformationPrompt, setTransformationPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setFileName(file.name);
      setFileType(file.type);

      const data = await parseFile(file);
      setFileData(data);
      // Reset transformed data when a new file is uploaded
      setTransformedData([]);
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
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      setTransformedData(result.transformedData);
    } catch (err) {
      setError(`Error transforming data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransformAll = async () => {
    if (!fileData || !transformationPrompt.trim()) {
      setError('Please upload a file and provide transformation instructions');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Process data in batches to avoid timeout
      const batchSize = 100;
      let transformedRows: string[][] = [];

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
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const result = await response.json();
        transformedRows = [...transformedRows, ...result.transformedData];
      }

      setTransformedData(transformedRows);
    } catch (err) {
      setError(`Error transforming data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (format: 'csv' | 'tsv' | 'json' | 'excel' = 'csv') => {
    if (!transformedData.length || !fileData) return;

    let content: string | Blob;
    let mimeType: string;
    let outputExtension: string = format;

    switch (format) {
      case 'csv':
        content = transformedData.map(row => row.join(',')).join('\n');
        mimeType = 'text/csv';
        break;
      case 'tsv':
        content = transformedData.map(row => row.join('\t')).join('\n');
        mimeType = 'text/tab-separated-values';
        break;
      case 'json':
        // Create JSON with headers as keys
        const jsonData = transformedData.map(row => {
          const rowObj: Record<string, string> = {};
          fileData.headers.forEach((header, index) => {
            rowObj[header] = row[index] || '';
          });
          return rowObj;
        });
        content = JSON.stringify(jsonData, null, 2);
        mimeType = 'application/json';
        break;
      case 'excel':
        // Create Excel file using the xlsx library
        import('xlsx').then(XLSX => {
          // Create a new workbook
          const wb = XLSX.utils.book_new();

          // Add headers as the first row of data
          const excelData = [fileData.headers, ...transformedData];

          // Create a worksheet from the data
          const ws = XLSX.utils.aoa_to_sheet(excelData);

          // Add the worksheet to the workbook
          XLSX.utils.book_append_sheet(wb, ws, "Transformed Data");

          // Generate Excel file
          const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

          // Create a Blob from the buffer
          const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

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
        });
        return; // Early return since Excel handling is async
      default:
        content = transformedData.map(row => row.join(',')).join('\n');
        mimeType = 'text/csv';
        outputExtension = 'csv';
    }

    // Create a filename with the new extension
    const baseName = fileName.split('.')[0] || 'transformed_data';
    const outputFilename = `${baseName}_transformed.${outputExtension}`;

    // For non-Excel formats (which return early)
    const blob = new Blob([content as string], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              Upload your data file and describe how you want it transformed. Parsec will use AI to process your data according to your instructions.
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
                    {fileData.data.length} rows of data
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

                  <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        onClick={handleTransform}
                        disabled={isLoading || !fileData}
                    >
                      Preview Transformation
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleTransformAll}
                        disabled={isLoading || !fileData || !transformedData.length}
                    >
                      Transform All Data
                    </Button>

                    {transformedData.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
                            Download as:
                          </Typography>
                          <Button
                              variant="outlined"
                              onClick={() => handleDownload('csv')}
                              title="Download as CSV file"
                              size="small"
                              endIcon={<TableViewIcon />}
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
                              sx={{ minWidth: '100px', width: '100px' }}
                          >
                            Excel
                          </Button>
                        </Box>
                    )}
                  </Box>

                  {isLoading && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                      </Box>
                  )}

                  {transformedData.length > 0 && (
                      <TransformationPreview
                          originalData={fileData}
                          transformedData={transformedData}
                      />
                  )}
                </Box>
            )}
          </Paper>
        </Container>
        <Footer />
      </Box>
  );
}