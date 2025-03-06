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

  const handleDownload = () => {
    if (!transformedData.length) return;

    let content: string;
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'txt';

    if (fileExtension === 'csv' || fileExtension === 'tsv') {
      const delimiter = fileExtension === 'csv' ? ',' : '\t';
      content = transformedData.map(row => row.join(delimiter)).join('\n');
    } else {
      content = transformedData.map(row => row.join('\t')).join('\n');
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transformed_${fileName}`;
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

                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
                    <Button
                        variant="outlined"
                        onClick={handleDownload}
                        disabled={!transformedData.length}
                    >
                      Download Result
                    </Button>
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