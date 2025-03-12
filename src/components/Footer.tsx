import { Box, Container, Typography, Link } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function Footer() {
    // Get support email from environment variable
    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

    return (
        <Box component="footer" sx={{ py: 2, mt: 'auto', backgroundColor: 'background.paper', borderTop: '1px solid #e0e0e0' }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                        © {new Date().getFullYear()} Parsec
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                        <Link href="/privacy" color="inherit" underline="hover" variant="body2">
                            Privacy
                        </Link>
                        <Link href="/terms" color="inherit" underline="hover" variant="body2">
                            Terms
                        </Link>
                        <Link
                            href="https://github.com/david-ta-ming/parsec"
                            color="inherit"
                            underline="hover"
                            variant="body2"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                            <GitHubIcon fontSize="small" />
                            GitHub
                        </Link>
                        {supportEmail && (
                            <Link
                                href={`mailto:${supportEmail}`}
                                color="inherit"
                                underline="hover"
                                variant="body2"
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                            >
                                <EmailIcon fontSize="small" />
                                Support
                            </Link>
                        )}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}