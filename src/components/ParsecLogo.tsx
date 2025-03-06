import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import Image from 'next/image';

interface ParsecLogoProps {
    sx?: SxProps<Theme>;
    size?: number;
    color?: string;
}

export default function ParsecLogo({ sx, size = 28, color }: ParsecLogoProps) {
    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size,
                height: size,
                color: color || 'primary.main',
                ...sx,
            }}
        >
            <Image
                src="/favicon.svg"
                alt="Parsec Logo"
                width={size}
                height={size}
                priority
            />
        </Box>
    );
}