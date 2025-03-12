import { Box, Container, Typography, Paper, Button, Grid, Card, CardContent, CardHeader, Divider } from '@mui/material';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';

export default function HowToUse() {
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
                        How to Use Parsec
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        Transform your data easily with natural language instructions
                    </Typography>

                    <Typography variant="body1" paragraph sx={{ mt: 3 }}>
                        Parsec is an AI-powered data transformation tool that allows you to transform your data using simple English instructions.
                        Follow these steps to transform your data:
                    </Typography>

                    <Grid container spacing={3} sx={{ mt: 2 }}>
                        <Grid item xs={12}>
                            <Card>
                                <CardHeader
                                    title="Step 1: Upload Your Data"
                                    avatar={<CloudUploadIcon color="primary" />}
                                    sx={{ pb: 1 }}
                                />
                                <Divider />
                                <CardContent>
                                    <Typography variant="body1" paragraph>
                                        Click on the upload area or drag and drop your file to upload. Parsec supports:
                                    </Typography>
                                    <Box component="ul" sx={{ pl: 2 }}>
                                        <Typography component="li" variant="body1">CSV files</Typography>
                                        <Typography component="li" variant="body1">TSV (Tab-separated) files</Typography>
                                        <Typography component="li" variant="body1">TXT files with delimited data</Typography>
                                        <Typography component="li" variant="body1">Excel files (.xlsx, .xls)</Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                        If your file has headers in the first row, make sure the "File has headers" toggle is turned on.
                                        If not, turn it off, and Parsec will automatically generate column names.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card>
                                <CardHeader
                                    title="Step 2: Describe Your Transformation"
                                    avatar={<TextFormatIcon color="primary" />}
                                    sx={{ pb: 1 }}
                                />
                                <Divider />
                                <CardContent>
                                    <Typography variant="body1" paragraph>
                                        Write clear instructions for how you want your data transformed. Be specific about what changes you want to make to each column.
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        <strong>Example instructions:</strong>
                                    </Typography>
                                    <Box sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)', p: 2, borderRadius: 1, mb: 2 }}>
                                        <Typography variant="body2" component="div">
                                            "Convert dates in column 'Purchase Date' from MM/DD/YYYY to YYYY-MM-DD format,
                                            format all phone numbers in 'Phone' column as (XXX) XXX-XXXX, and create a new
                                            column 'Full Name' by combining 'First Name' and 'Last Name' columns."
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        The more specific your instructions, the better your results will be. You can specify
                                        format changes, data calculations, text transformations, and more.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card>
                                <CardHeader
                                    title="Step 3: Preview Transformation"
                                    avatar={<VisibilityIcon color="primary" />}
                                    sx={{ pb: 1 }}
                                />
                                <Divider />
                                <CardContent>
                                    <Typography variant="body1" paragraph>
                                        Click the "Preview Transformation" button to see a sample of how your data will be transformed.
                                        This will show the first few rows of your data with the transformations applied.
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        If the preview doesn't look right, you can adjust your transformation instructions and try again.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card>
                                <CardHeader
                                    title="Step 4: Download Your Transformed Data"
                                    avatar={<DownloadIcon color="primary" />}
                                    sx={{ pb: 1 }}
                                />
                                <Divider />
                                <CardContent>
                                    <Typography variant="body1" paragraph>
                                        Once you're satisfied with the preview, download your fully transformed data file.
                                        Choose your preferred format:
                                    </Typography>
                                    <Box component="ul" sx={{ pl: 2 }}>
                                        <Typography component="li" variant="body1">CSV (Comma-separated values)</Typography>
                                        <Typography component="li" variant="body1">TSV (Tab-separated values)</Typography>
                                        <Typography component="li" variant="body1">JSON (JavaScript Object Notation)</Typography>
                                        <Typography component="li" variant="body1">Excel (.xlsx)</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, mb: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Example Transformations
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Here are some examples of what you can do with Parsec:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2 }}>
                            <Typography component="li" variant="body1">Date format conversions (MM/DD/YYYY to YYYY-MM-DD)</Typography>
                            <Typography component="li" variant="body1">Phone number formatting ((123) 456-7890)</Typography>
                            <Typography component="li" variant="body1">Name capitalization or standardization</Typography>
                            <Typography component="li" variant="body1">Currency formatting ($1,234.56)</Typography>
                            <Typography component="li" variant="body1">Unit conversions (km to miles, Celsius to Fahrenheit)</Typography>
                            <Typography component="li" variant="body1">Calculations between columns (price * quantity)</Typography>
                            <Typography component="li" variant="body1">Text extraction (domain from email, first name from full name)</Typography>
                            <Typography component="li" variant="body1">Data cleaning (removing special characters, fixing typos)</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Data Privacy
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Parsec is designed with privacy in mind. Your data is never stored on our servers
                            beyond the temporary processing time needed for transformation. All transformations
                            are performed securely using AI technology, and once complete, your data is not retained.
                        </Typography>
                        <Button
                            component={Link}
                            href="/privacy"
                            variant="outlined"
                            size="small"
                            sx={{ mt: 1 }}
                        >
                            Read our Privacy Policy
                        </Button>
                    </Box>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Button
                        component={Link}
                        href="/"
                        variant="contained"
                        color="primary"
                        size="large"
                    >
                        Start Transforming Your Data
                    </Button>
                </Box>
            </Container>
            <Footer />
        </Box>
    );
}