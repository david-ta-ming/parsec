import React from 'react';
import {
    Box,
    Paper,
    Typography,
    LinearProgress,
    CircularProgress,
    Fade,
    Button
} from '@mui/material';
import DataArrayIcon from '@mui/icons-material/DataArray';
import SyncIcon from '@mui/icons-material/Sync';
import CancelIcon from '@mui/icons-material/Cancel';

// Define keyframe animations using Material UI's sx prop
const spinAnimation = {
    '@keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' }
    },
    animation: 'spin 2s linear infinite'
};

const pulseAnimation = {
    '@keyframes pulse': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.7 },
        '100%': { opacity: 1 }
    },
    animation: 'pulse 1.5s infinite'
};

interface TransformationProgressModalProps {
    isOpen: boolean;
    progress: number;
    stage: string;
    indeterminate: boolean;
    totalRows: number;
    onCancel: () => void;
    isCancelling: boolean;
}

const TransformationProgressModal: React.FC<TransformationProgressModalProps> = ({
                                                                                     isOpen,
                                                                                     progress,
                                                                                     stage,
                                                                                     indeterminate,
                                                                                     totalRows,
                                                                                     onCancel,
                                                                                     isCancelling
                                                                                 }) => {
    if (!isOpen) return null;

    return (
        <Fade in={isOpen}>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1300,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        minWidth: 350,
                        maxWidth: '90%',
                        maxHeight: '90%',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    {/* Header with icon */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        {indeterminate ? (
                            <SyncIcon
                                fontSize="large"
                                color="primary"
                                sx={spinAnimation}
                            />
                        ) : (
                            <DataArrayIcon fontSize="large" color="primary" />
                        )}
                        <Typography variant="h5">
                            {isCancelling ? "Cancelling..." : "Transforming Data"}
                        </Typography>
                    </Box>

                    {/* Progress visualization */}
                    <Box sx={{ width: '100%', mt: 1 }}>
                        {isCancelling ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <CircularProgress size={36} thickness={4} color="secondary" />
                            </Box>
                        ) : indeterminate ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <CircularProgress size={36} thickness={4} />
                            </Box>
                        ) : (
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{ height: 10, borderRadius: 1 }}
                            />
                        )}

                        {!indeterminate && !isCancelling && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Processed
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    {Math.round(progress)}%
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Current stage message */}
                    <Typography
                        variant="body1"
                        sx={{
                            mt: 1,
                            color: 'text.primary',
                            fontWeight: 'medium',
                            ...(indeterminate || isCancelling ? pulseAnimation : {})
                        }}
                    >
                        {isCancelling ? "Cancelling operation..." : stage}
                    </Typography>

                    {/* Additional context */}
                    {!isCancelling && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Processing {totalRows.toLocaleString()} rows of data
                        </Typography>
                    )}

                    {indeterminate && !isCancelling && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                            This may take a moment for larger datasets...
                        </Typography>
                    )}

                    {/* Cancel button */}
                    {!isCancelling && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<CancelIcon />}
                            onClick={onCancel}
                            sx={{ mt: 2 }}
                            disabled={isCancelling}
                        >
                            Cancel
                        </Button>
                    )}
                </Paper>
            </Box>
        </Fade>
    );
};

export default TransformationProgressModal;