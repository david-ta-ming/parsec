import { Box, Container, Typography, Link } from '@mui/material';

export default function Footer() {
    return (
        <Box component="footer" sx={{ py: 3, mt: 'auto', backgroundColor: 'background.paper', borderTop: '1px solid #e0e0e0' }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                        © {new Date().getFullYear()} Parsec. All rights reserved.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Link href="/privacy" color="inherit" underline="hover" variant="body2">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" color="inherit" underline="hover" variant="body2">
                            Terms of Service
                        </Link>
                    </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Parsec securely processes your data without storing any information on our servers.
                </Typography>
            </Container>
        </Box>
    );
}