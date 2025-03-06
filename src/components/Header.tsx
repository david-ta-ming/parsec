'use client';

import { AppBar, Toolbar, Typography, Box, Button, Container } from '@mui/material';
import ParsecLogo from './ParsecLogo';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Header() {
    return (
        <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ height: 64 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <ParsecLogo sx={{ mr: 1 }} />
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}
                        >
                            Parsec
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            color="inherit"
                            startIcon={<GitHubIcon />}
                            href="https://github.com/your-username/parsec"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textTransform: 'none' }}
                        >
                            GitHub
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}