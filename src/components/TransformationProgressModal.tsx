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
import CancelIcon from '@mui/icons-material/Cancel';

interface TransformationProgressModalProps {
    isOpen: boolean;
    progress: number;
    totalRows: number;
    onCancel: () => void;
    isCancelling: boolean;
}

const TransformationProgressModal: React.FC<TransformationProgressModalProps> = ({
                                                                                     isOpen,
                                                                                     progress,
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
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    {/* Simple title */}
                    <Typography variant="h5">
                        {isCancelling ? "Cancelling..." : "Transforming Data"}
                    </Typography>

                    {/* Progress bar */}
                    <Box sx={{ width: '100%', mt: 1 }}>
                        {isCancelling ? (
                            <CircularProgress size={36} />
                        ) : (
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{ height: 10, borderRadius: 1 }}
                            />
                        )}

                        {!isCancelling && (
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

                    {/* Processing information */}
                    <Typography variant="body2" color="text.secondary">
                        Processing {totalRows.toLocaleString()} rows of data
                    </Typography>

                    {/* Cancel button */}
                    {!isCancelling && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<CancelIcon />}
                            onClick={onCancel}
                            disabled={isCancelling}
                            sx={{ mt: 1 }}
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