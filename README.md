# Parsec: AI-Powered Data Transformation

Parsec is an intuitive data transformation tool that uses AI to process data based on natural language instructions. Simply upload your data file, describe the transformations you need in plain English, and let Parsec handle the rest.

![Parsec Logo](public/favicon.svg)

## 🚀 Key Features

- **Natural Language Processing**: Transform your data by describing what you want in plain English
- **Multiple File Formats**: Support for CSV, TSV, TXT, and Excel files
- **Privacy-First Approach**: Your data is never stored permanently - it's only processed temporarily
- **Interactive Preview**: See a sample of your transformed data before processing the entire file
- **Multiple Export Options**: Download your transformed data as CSV, TSV, JSON, or Excel
- **Smart Header Detection**: Automatic handling of files with or without headers
- **Efficient Processing**: Large datasets are handled through intelligent batching

## 🔧 Technology Stack

- **Frontend**: React 18, Next.js 14 (App Router), TypeScript
- **UI Framework**: Material UI v5
- **AI Processing**: OpenAI API
- **File Processing**: SheetJS, PapaParse
- **State Management**: React Hooks
- **Deployment**: AWS Amplify compatible

## 🛠️ Getting Started

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

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the development server:
   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application

## 📋 How to Use

### 1. Upload Your Data

- Click on the upload area or drag and drop your file
- Toggle "File has headers" based on your file structure
- Supported formats: CSV, TSV, TXT, Excel (.xlsx, .xls)

### 2. Describe Your Transformation

Write clear instructions for how you want your data transformed. Be specific about changes you want to make to each column.

**Example transformations:**
- Convert dates from MM/DD/YYYY to YYYY-MM-DD format
- Format all phone numbers as (XXX) XXX-XXXX
- Create a new column 'Full Name' by combining 'First Name' and 'Last Name'
- Calculate the total cost by multiplying 'Quantity' and 'Price'
- Remove special characters from all text fields
- Convert all monetary values to numbers by removing currency symbols

### 3. Preview the Transformation

Click "Preview Transformation" to see a sample of how your data will be transformed. This helps you verify the transformation is working as expected before processing the entire dataset.

### 4. Download Your Transformed Data

Once you're satisfied with the preview:
- Choose your preferred format (CSV, TSV, JSON, or Excel)
- Click the corresponding download button
- The full dataset will be processed and downloaded to your device

## 🔒 Privacy & Security

- **Zero Data Retention**: Your data is never stored on our servers
- **In-Browser Processing**: Initial file parsing happens in your browser
- **Secure API Calls**: Data is securely transmitted for AI processing only
- **No User Accounts**: No personal information is collected
- **Transient Processing**: Data is only held in memory during the transformation process

## 🏗️ Project Structure

```
parsec/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── api/              # API routes
│   │   │   └── transform/    # Data transformation API endpoint
│   │   ├── how-to-use/       # How-to-use guide page
│   │   ├── privacy/          # Privacy policy page
│   │   ├── layout.tsx        # Root layout with theme
│   │   └── page.tsx          # Main application page
│   ├── components/           # React components
│   │   ├── FileUpload.tsx    # File upload component
│   │   ├── TransformationPreview.tsx    # Results preview
│   │   └── ...               # Other UI components
│   ├── theme/                # Material UI theming
│   └── utils/                # Utility functions
│       ├── fileParser.ts     # File parsing utilities
│       └── logger.ts         # Logging utilities
└── ...
```

## 🚢 Deployment

### AWS Amplify

The project includes an `amplify.yml` configuration file for AWS Amplify deployment. Set these environment variables in your Amplify console:

- `OPENAI_API_KEY` (required): Your OpenAI API key
- `OPENAI_MODEL` (optional): Defaults to "gpt-4o-mini" if not specified
- `LOG_LEVEL` (optional): Logging level (default: "info")
- `NEXT_PUBLIC_SUPPORT_EMAIL` (optional): Support email for the footer
- `NEXT_PUBLIC_GOOGLE_VERIFICATION_CODE` (optional): For Google Search Console verification
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` (optional): For Google Analytics integration

### Other Platforms

For deployment on Vercel, Netlify, or other platforms, configure the environment variables according to the platform's documentation.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using Next.js and OpenAI