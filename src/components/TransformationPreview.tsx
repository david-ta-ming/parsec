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
    transformedData: Record<string, string>[];
}

export default function TransformationPreview({ originalData, transformedData }: TransformationPreviewProps) {
    // Display at most 10 rows to prevent UI lag
    const displayRowCount = Math.min(10, transformedData.length);
    const transformedDisplayData = transformedData.slice(0, displayRowCount);

    // Get headers from the first transformed row, or use the original headers
    const headers = transformedData.length > 0
        ? Object.keys(transformedData[0])
        : originalData.headers;

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
                            {headers.map((header, index) => (
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
                                {headers.map((header, cellIndex) => (
                                    <TableCell key={cellIndex}>
                                        {row[header] || ''}
                                    </TableCell>
                                ))}
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