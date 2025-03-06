# Parsec

Parsec is an AI-powered data transformation tool that allows users to transform their data using natural language instructions. Simply upload your data file, describe how you want it transformed, and Parsec will use AI to process your data accordingly.

## Features

- Upload CSV, TSV, TXT, or Excel files
- Transform data using natural language instructions
- Preview transformations before downloading
- Process data without storing any information on servers
- Download transformed data in the same format as the input file

## Technology Stack

- **Frontend**: React, Next.js, TypeScript, Material UI
- **AI**: OpenAI API
- **File Processing**: SheetJS (xlsx)

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

## Usage

1. **Upload a File**: Click the upload area or drag and drop your data file (CSV, TSV, TXT, or Excel).
2. **Describe the Transformation**: Enter instructions for how you want the data transformed (e.g., "Convert dates from MM/DD/YYYY to YYYY-MM-DD format").
3. **Preview Transformation**: Click "Preview Transformation" to see how your data will be transformed.
4. **Transform All Data**: If you're satisfied with the preview, click "Transform All Data".
5. **Download Result**: Click "Download Result" to save the transformed data.

## Example Transformations

- "Convert all text to uppercase"
- "Change date format from MM/DD/YYYY to YYYY-MM-DD"
- "Format phone numbers as (XXX) XXX-XXXX"
- "Replace all empty values with 'N/A'"
- "Remove dollar signs from prices and convert to numbers"

## Privacy

Parsec processes all data in the browser and via secure API calls. No user data is stored on our servers. The only data sent to OpenAI's API is what's needed to perform the transformations.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.