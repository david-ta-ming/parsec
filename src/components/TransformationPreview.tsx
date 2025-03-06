'use client';

import { useState } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Tabs,
    Tab
} from '@mui/material';
import { FileData } from '@/utils/fileParser';

interface TransformationPreviewProps {
    originalData: FileData;
    transformedData: string[][];
}

export default function TransformationPreview({ originalData, transformedData }: TransformationPreviewProps) {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Display at most 10 rows to prevent UI lag
    const displayRowCount = Math.min(10, originalData.data.length, transformedData.length);
    const originalDisplayData = originalData.data.slice(0, displayRowCount);
    const transformedDisplayData = transformedData.slice(0, displayRowCount);

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
                Transformation Preview
            </Typography>

            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Transformed Data" />
                <Tab label="Original Data" />
                <Tab label="Side by Side" />
            </Tabs>

            {tabValue === 0 && (
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                {transformedDisplayData[0]?.map((_, index) => (
                                    <TableCell key={index}>
                                        {originalData.headers[index] || `Column ${index + 1}`}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transformedDisplayData.map((row, rowIndex) => (
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
            )}

            {tabValue === 1 && (
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                {originalData.headers.map((header, index) => (
                                    <TableCell key={index}>{header}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {originalDisplayData.map((row, rowIndex) => (
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
            )}

            {tabValue === 2 && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TableContainer component={Paper} sx={{ maxHeight: 400, flex: 1 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    {originalData.headers.map((header, index) => (
                                        <TableCell key={index}>{header}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {originalDisplayData.map((row, rowIndex) => (
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

                    <TableContainer component={Paper} sx={{ maxHeight: 400, flex: 1 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    {transformedDisplayData[0]?.map((_, index) => (
                                        <TableCell key={index}>
                                            {originalData.headers[index] || `Column ${index + 1}`}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transformedDisplayData.map((row, rowIndex) => (
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
                </Box>
            )}

            {transformedData.length > displayRowCount && (
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    Showing {displayRowCount} of {transformedData.length} rows. Download the file to see all rows.
                </Typography>
            )}
        </Box>
    );
}