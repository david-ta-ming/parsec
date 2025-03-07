// Updated TransformationPreview.tsx
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography
} from '@mui/material';
import { FileData } from '@/utils/fileParser';

interface TransformationPreviewProps {
    originalData: FileData;
    transformedData: string[][];
}

export default function TransformationPreview({ originalData, transformedData }: TransformationPreviewProps) {
    // Display at most 10 rows to prevent UI lag
    const displayRowCount = Math.min(10, originalData.data.length, transformedData.length);
    const transformedDisplayData = transformedData.slice(0, displayRowCount);

    // Ensure the headers match the original headers
    const displayHeaders = originalData.headers.map(header => header || '');

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
                Transformed Data Preview
            </Typography>

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            {displayHeaders.map((header, index) => (
                                <TableCell key={index}>
                                    {header || `Column ${index + 1}`}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transformedDisplayData.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                <TableCell>{rowIndex + 1}</TableCell>
                                {row.map((cell, cellIndex) => {
                                    // Only show data for columns that exist in the original headers
                                    if (cellIndex < displayHeaders.length) {
                                        return (
                                            <TableCell key={cellIndex}>
                                                {cell}
                                            </TableCell>
                                        );
                                    }
                                    return null;
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {transformedData.length > displayRowCount && (
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    Showing {displayRowCount} of {transformedData.length} rows. Download the file to see all rows.
                </Typography>
            )}

            {!originalData.hasHeaders && (
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                    Note: Column headers were automatically generated since the original file did not have headers.
                </Typography>
            )}
        </Box>
    );
}