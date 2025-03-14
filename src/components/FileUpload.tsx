'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    styled,
    FormControlLabel,
    Switch,
    Tooltip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const UploadBox = styled(Box)(({ theme }) => ({
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

interface FileUploadProps {
    onFileUpload: (file: File, hasHeaders: boolean) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [hasHeaders, setHasHeaders] = useState(true);
    const [isJsonFile, setIsJsonFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update isJsonFile when selectedFile changes
    useEffect(() => {
        if (selectedFile) {
            const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
            setIsJsonFile(fileExtension === 'json');

            // If it's a JSON file, always set hasHeaders to true
            if (fileExtension === 'json') {
                setHasHeaders(true);
            }
        } else {
            setIsJsonFile(false);
        }
    }, [selectedFile]);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            handleFile(file);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            handleFile(file);
        }
    };

    const handleFile = (file: File) => {
        setSelectedFile(file);

        // Check if it's a JSON file and set hasHeaders to true if it is
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (fileExtension === 'json') {
            setHasHeaders(true);
        }

        onFileUpload(file, fileExtension === 'json' ? true : hasHeaders);
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleHeaderToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHasHeaders = e.target.checked;
        setHasHeaders(newHasHeaders);

        // If a file is already selected, reprocess it with the new header setting
        if (selectedFile) {
            onFileUpload(selectedFile, newHasHeaders);
        }
    };

    const acceptedFileTypes = '.csv,.tsv,.txt,.xlsx,.xls,.json';

    return (
        <Box>
            <UploadBox
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleUploadClick}
                sx={{
                    backgroundColor: isDragging ? 'action.hover' : 'transparent',
                    mb: 2
                }}
            >
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" component="div" gutterBottom>
                    {selectedFile
                        ? `Selected: ${selectedFile.name}`
                        : 'Drag & drop a file here or click to select'
                    }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Supports CSV, TSV, TXT, JSON, and Excel files
                </Typography>
                <VisuallyHiddenInput
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept={acceptedFileTypes}
                />
            </UploadBox>

            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={hasHeaders}
                            onChange={handleHeaderToggleChange}
                            color="primary"
                            disabled={isJsonFile}
                        />
                    }
                    label="File has headers"
                />
                <Tooltip title={isJsonFile
                    ? "JSON files with objects automatically use keys as headers"
                    : "Turn off if your file does not have column headers in the first row. For JSON files with objects, headers are automatically extracted."}
                         arrow
                >
                    <HelpOutlineIcon color="action" fontSize="small" sx={{ ml: 1 }} />
                </Tooltip>
            </Box>
        </Box>
    );
}