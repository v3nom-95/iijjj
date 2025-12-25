import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHEET_ID = '1MOtMXFyLc5i-3syBp9QD5KtfBhcELGgOeiYThaS3I5g';
const SHEET_GID = '1582901928';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching alumni data from Google Sheets...');
    
    // Fetch the sheet as CSV (publicly accessible)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
    
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      console.error('Failed to fetch sheet:', response.status, response.statusText);
      throw new Error(`Failed to fetch sheet: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('CSV fetched successfully, parsing...');
    
    // Parse CSV
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Skip header row (first row is the title row)
    const alumni: { rollNo: string; name: string; email: string }[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Parse CSV properly handling commas in quoted fields
      const columns = parseCSVLine(line);
      
      // Columns: S.NO, Roll number, Name, Contact, Email
      if (columns.length >= 5) {
        const rollNo = columns[1]?.trim();
        const name = columns[2]?.trim();
        const email = columns[4]?.trim();
        
        if (rollNo && name && email && rollNo !== 'Roll number') {
          alumni.push({
            rollNo,
            name,
            email
          });
        }
      }
    }
    
    console.log(`Parsed ${alumni.length} alumni records`);
    
    return new Response(JSON.stringify({ alumni }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error fetching alumni:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}
