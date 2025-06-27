/**
 * CSV parsing utilities for SecureCollab
 */

export interface ParsedCSV {
  headers: string[];
  rows: string[][];
  schema: string;
  dataAsBytes: number[];
}

/**
 * Parse a CSV file and convert it to a format suitable for backend upload
 * @param file The CSV file to parse
 * @returns Promise with parsed CSV data
 */
export async function parseCSVFile(file: File): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const parsed = parseCSVText(csvText);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Parse CSV text content
 * @param csvText The CSV text content
 * @returns Parsed CSV data
 */
export function parseCSVText(csvText: string): ParsedCSV {
  const lines = csvText.trim().split('\n');
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }
  
  // Parse headers
  const headers = parseCSVLine(lines[0]);
  
  // Parse data rows
  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      rows.push(parseCSVLine(lines[i]));
    }
  }
  
  // Generate schema
  const schema = generateSchema(headers, rows);
  
  // Convert to bytes for backend
  const dataAsBytes = stringToBytes(csvText);
  
  return {
    headers,
    rows,
    schema,
    dataAsBytes
  };
}

/**
 * Parse a single CSV line, handling quoted values
 * @param line The CSV line to parse
 * @returns Array of field values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

/**
 * Generate a schema description from CSV headers and sample data
 * @param headers Column headers
 * @param rows Data rows
 * @returns Schema description string
 */
function generateSchema(headers: string[], rows: string[][]): string {
  const schema: Record<string, string> = {};
  
  headers.forEach((header, index) => {
    // Analyze the data type based on sample values
    const sampleValues = rows.slice(0, 10).map(row => row[index]).filter(val => val && val.trim());
    
    if (sampleValues.length === 0) {
      schema[header] = 'string';
      return;
    }
    
    // Check if all values are numbers
    const isNumeric = sampleValues.every(val => !isNaN(Number(val)) && val.trim() !== '');
    if (isNumeric) {
      // Check if all are integers
      const isInteger = sampleValues.every(val => Number.isInteger(Number(val)));
      schema[header] = isInteger ? 'integer' : 'float';
    } else {
      // Check if it looks like a date
      const isDate = sampleValues.some(val => !isNaN(Date.parse(val)));
      schema[header] = isDate ? 'date' : 'string';
    }
  });
  
  return JSON.stringify(schema, null, 2);
}

/**
 * Convert string to byte array
 * @param str The string to convert
 * @returns Array of byte values
 */
function stringToBytes(str: string): number[] {
  const encoder = new TextEncoder();
  return Array.from(encoder.encode(str));
}

/**
 * Validate CSV file before upload
 * @param file The file to validate
 * @returns Validation result
 */
export function validateCSVFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
    return { valid: false, error: 'File must be a CSV file' };
  }
  
  // Check file size (limit to 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  return { valid: true };
}
