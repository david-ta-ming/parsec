import { Box, Container, Typography, Paper, Button } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function TermsOfService() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Container maxWidth="md" sx={{ mt: 4, mb: 4, flex: '1 0 auto' }}>
                <Button
                    component={Link}
                    href="/"
                    startIcon={<ArrowBackIcon />}
                    sx={{ mb: 2 }}
                >
                    Back to Home
                </Button>

                <Paper sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Terms of Service
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Last updated: March 6, 2025
                    </Typography>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Introduction
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Welcome to Parsec. By accessing or using our services, you agree to be bound by these Terms of Service (&#34;Terms&#34;). Please read them carefully.
                    </Typography>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Description of Service
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Parsec is a data transformation tool that allows users to upload data files and transform them using AI-powered natural language instructions. The service processes various file formats including CSV, TSV, TXT, and Excel files.
                    </Typography>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        User Responsibilities
                    </Typography>
                    <Typography variant="body1" paragraph>
                        When using Parsec, you agree to:
                    </Typography>
                    <ol>
                        <Typography component="li" variant="body1">
                            <strong>Provide Valid Data</strong>: Upload only valid data files in supported formats.
                        </Typography>
                        <Typography component="li" variant="body1">
                            <strong>Appropriate Content</strong>: Not use the service to process harmful, illegal, or sensitive personal data.
                        </Typography>
                        <Typography component="li" variant="body1">
                            <strong>Respect System Limitations</strong>: Not overload the system with unnecessarily large files or excessive requests.
                        </Typography>
                        <Typography component="li" variant="body1">
                            <strong>Proper Authorization</strong>: Only upload data that you have proper authorization to process.
                        </Typography>
                        <Typography component="li" variant="body1">
                            <strong>Compliance</strong>: Comply with all applicable laws and regulations regarding data processing.
                        </Typography>
                    </ol>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Intellectual Property
                    </Typography>
                    <Typography variant="body1" paragraph>
                        You retain all rights to the data you upload to Parsec. We do not claim ownership of your data or the resulting transformed data.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        The Parsec application, including its design, code, and functionality, is owned by us and is protected by intellectual property laws. You may not copy, modify, distribute, or reverse engineer the service without our explicit permission.
                    </Typography>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Service Limitations
                    </Typography>
                    <Typography variant="h6" component="h3" sx={{ mt: 3, mb: 1 }}>
                        Usage Limits
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1">API requests are rate-limited to protect system resources</Typography>
                        <Typography component="li" variant="body1">File size may be limited based on technical constraints</Typography>
                        <Typography component="li" variant="body1">Processing time may vary based on file size and complexity</Typography>
                    </ul>

                    <Typography variant="h6" component="h3" sx={{ mt: 3, mb: 1 }}>
                        No Warranties
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Parsec is provided &#34;as is&#34; without warranties of any kind, either express or implied. We do not guarantee that:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1">The service will meet your specific requirements</Typography>
                        <Typography component="li" variant="body1">The service will be uninterrupted, timely, secure, or error-free</Typography>
                        <Typography component="li" variant="body1">The results obtained from using the service will be accurate or reliable</Typography>
                    </ul>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Liability Limitations
                    </Typography>
                    <Typography variant="body1" paragraph>
                        To the fullest extent permitted by law, we shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages resulting from your use of the service, including but not limited to:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1">Data loss or corruption</Typography>
                        <Typography component="li" variant="body1">Loss of profits or revenue</Typography>
                        <Typography component="li" variant="body1">Business interruption</Typography>
                        <Typography component="li" variant="body1">Any other damages or losses arising from the use of Parsec</Typography>
                    </ul>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Changes to Terms
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We reserve the right to modify these Terms at any time. We will notify users of any significant changes by posting a notice on our website. Your continued use of Parsec after such modifications constitutes your acceptance of the updated Terms.
                    </Typography>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Termination
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </Typography>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Governing Law
                    </Typography>
                    <Typography variant="body1" paragraph>
                        These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
                    </Typography>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Contact Us
                    </Typography>
                    <Typography variant="body1" paragraph>
                        If you have any questions about these Terms, please contact us at:
                        <br />
                        Email: <Link href="mailto:terms@parsecdata.com">terms@parsecdata.com</Link>
                    </Typography>
                </Paper>
            </Container>
            <Footer />
        </Box>
    );
}