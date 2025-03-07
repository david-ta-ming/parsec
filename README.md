# Parsec

Parsec is an AI-powered data transformation tool that allows users to transform their data using natural language instructions. Simply upload your data file, describe how you want it transformed, and Parsec will use AI to process your data accordingly.

## Features

- **Natural Language Transformations**: Describe your transformation needs in plain English
- **Multiple File Formats**: Upload CSV, TSV, TXT, or Excel files
- **Data Privacy**: All processing happens in-browser or via secure API calls without storing user data
- **Transformation Preview**: See how your data will be transformed before applying changes to all rows
- **Multiple Output Formats**: Download transformed data as CSV, TSV, JSON, or Excel
- **Header Detection**: Automatically detects and handles files with or without headers
- **Batch Processing**: Efficiently processes large datasets in batches

## Technology Stack

- **Frontend**: React 18, Next.js 14 (App Router), TypeScript
- **UI Framework**: Material UI v5
- **AI Processing**: OpenAI API
- **File Processing**: SheetJS (xlsx)
- **Deployment**: Compatible with AWS Amplify

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- Yarn package manager
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/david-ta-ming/parsec.git
   cd parsec
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Run the development server:
   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

1. **Upload a File**:
   - Click the upload area or drag and drop your data file
   - Use the "File has headers" toggle if your file does or doesn't include column headers

2. **Describe the Transformation**:
   - Enter instructions in the text field using natural language
   - Be specific about the transformations you want to apply to each column

3. **Preview Transformation**:
   - Click "Preview Transformation" to see a sample of how your data will be transformed
   - The preview shows up to 10 rows to help you verify the transformation

4. **Download Results**:
   - Once satisfied with the preview, choose your preferred output format (CSV, TSV, JSON, or Excel)
   - Click the corresponding button to download the fully transformed dataset

## Example Transformations

Here are some examples of transformations you can request:

- "Convert all dates from MM/DD/YYYY to YYYY-MM-DD format"
- "Format phone numbers as (XXX) XXX-XXXX"
- "Capitalize all names in the 'Name' column"
- "Calculate the sum of 'Price' and 'Tax' columns into a new 'Total' column"
- "Convert all monetary values to numbers by removing dollar signs and commas"
- "Replace empty values with 'N/A' in all columns"
- "Round all decimal numbers to two decimal places"
- "Extract the domain name from all email addresses"
- "Combine 'First Name' and 'Last Name' columns into a 'Full Name' column"
- "Convert all temperatures from Fahrenheit to Celsius"

## Privacy and Security

Parsec is designed with privacy as a core principle:

- **No Data Storage**: Your data is never stored on our servers
- **Client-Side Processing**: Initial file parsing happens entirely in your browser
- **Secure API Calls**: Data is securely transmitted to the API for transformation
- **No User Accounts**: No personal information is collected
- **Temporary Processing**: Data is only held in memory during processing and then discarded

## Development

### Project Structure

```
parsec/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── api/              # API routes
│   │   │   └── transform/    # Data transformation API
│   │   ├── privacy/          # Privacy policy page
│   │   ├── terms/            # Terms of service page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main application page
│   ├── components/           # React components
│   │   ├── FileUpload.tsx    # File upload component
│   │   ├── Footer.tsx        # Footer component
│   │   ├── Header.tsx        # Header component
│   │   └── ...
│   ├── theme/                # Material UI theme
│   └── utils/                # Utility functions
│       ├── fileParser.ts     # File parsing utilities
│       └── logger.ts         # Logging utilities
├── public/                   # Public assets
├── .env.local.example        # Example environment variables
└── ...
```

### API Configuration

The application uses OpenAI's API for data transformation. To customize the AI model or parameters, modify the settings in `src/app/api/transform/route.ts`.

### Adding New File Formats

To add support for new file formats, extend the file parsing utilities in `src/utils/fileParser.ts`.

## Deployment

### AWS Amplify

The project includes an `amplify.yml` configuration file for easy deployment on AWS Amplify. Make sure to set the required environment variables in your Amplify console:

- `OPENAI_API_KEY`: Your OpenAI API key
- `LOG_LEVEL`: (Optional) Logging level (default: "info")

### Other Platforms

For deployment on other platforms like Vercel or Netlify, ensure you set the required environment variables according to the platform's documentation.

## License

This project is licensed under the MIT License - see the LICENSE file for details.