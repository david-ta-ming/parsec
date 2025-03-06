'use client';

import { Box, Container, Typography, Paper, Button } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function PrivacyPolicy() {
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
                        Privacy Policy
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Last updated: March 6, 2025
                    </Typography>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Introduction
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Welcome to Parsec ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your data. This Privacy Policy explains how we handle data when you use our data transformation services.
                    </Typography>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Information We Don't Collect
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Parsec is designed with privacy as a core principle. We <strong>do not</strong>:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1">Create user accounts or profiles</Typography>
                        <Typography component="li" variant="body1">Store your uploaded files on our servers</Typography>
                        <Typography component="li" variant="body1">Track your browsing history</Typography>
                        <Typography component="li" variant="body1">Use cookies for tracking purposes</Typography>
                        <Typography component="li" variant="body1">Collect personal information for marketing</Typography>
                        <Typography component="li" variant="body1">Share or sell any user data to third parties</Typography>
                    </ul>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        How Parsec Works
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Parsec operates as follows:
                    </Typography>
                    <ol>
                        <Typography component="li" variant="body1">
                            <strong>File Processing</strong>: When you upload a file, it is processed entirely in your browser or temporarily during API processing.
                        </Typography>
                        <Typography component="li" variant="body1">
                            <strong>Transformation</strong>: Your data is sent securely to our API service, which utilizes OpenAI's API to perform the requested transformations.
                        </Typography>
                        <Typography component="li" variant="body1">
                            <strong>Results</strong>: The transformed data is returned to your browser and is not stored on our servers once the operation is complete.
                        </Typography>
                        <Typography component="li" variant="body1">
                            <strong>No Persistence</strong>: After your session ends or you navigate away from Parsec, your data is not retained on our systems.
                        </Typography>
                    </ol>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Data Security
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We implement several measures to ensure your data remains secure:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1">All data transmissions are encrypted using HTTPS</Typography>
                        <Typography component="li" variant="body1">API requests are authenticated and rate-limited</Typography>
                        <Typography component="li" variant="body1">We use modern security practices to protect our infrastructure</Typography>
                        <Typography component="li" variant="body1">Data is processed in-memory and not written to persistent storage</Typography>
                    </ul>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Third-Party Services
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We use the following third-party services to provide functionality:
                    </Typography>
                    <ul>
                        <Typography component="li" variant="body1">
                            <strong>OpenAI API</strong>: For data transformation operations. Your data is sent to OpenAI according to their privacy policy and terms of service.
                        </Typography>
                        <Typography component="li" variant="body1">
                            <strong>Hosting Provider</strong>: For hosting our application. They do not have access to your data content.
                        </Typography>
                    </ul>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Changes to This Policy
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. Changes are effective when posted.
                    </Typography>

                    <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
                        Contact Us
                    </Typography>
                    <Typography variant="body1" paragraph>
                        If you have any questions about this Privacy Policy, please contact us at:
                        <br />
                        Email: <Link href="mailto:privacy@parsecdata.com">privacy@parsecdata.com</Link>
                    </Typography>
                </Paper>
            </Container>
            <Footer />
        </Box>
    );
}