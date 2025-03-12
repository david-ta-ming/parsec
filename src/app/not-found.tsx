// app/not-found.tsx
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export const metadata = {
    title: 'Page Not Found - Parsec',
    description: 'Sorry, we couldn\'t find the page you were looking for.',
};

export default function NotFound() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Container maxWidth="md" sx={{ mt: 8, mb: 8, flex: '1 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 600 }}>
                    <ErrorOutlineIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />

                    <Typography variant="h3" component="h1" gutterBottom>
                        Page Not Found
                    </Typography>

                    <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                        Sorry, we couldn't find the page you were looking for. It might have been moved, deleted, or never existed.
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            You might want to try:
                        </Typography>
                        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                            <li>Checking the URL for typos</li>
                            <li>Going back to the previous page</li>
                            <li>Starting from our homepage</li>
                        </ul>
                    </Box>

                    <Button
                        component={Link}
                        href="/"
                        variant="contained"
                        color="primary"
                        size="large"
                    >
                        Go to Homepage
                    </Button>
                </Paper>
            </Container>
            <Footer />
        </Box>
    );
}