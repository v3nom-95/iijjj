import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main index sheet with batch and links
const INDEX_SHEET_ID = '1MOtMXFyLc5i-3syBp9QD5KtfBhcELGgOeiYThaS3I5g';
const INDEX_GID = '0'; // First sheet (gid=0)

interface Alumni {
  rollNo: string;
  name: string;
  email: string;
  batch: string;
}

interface BatchInfo {
  batch: string;
  sheetUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching batch index from Google Sheets...');
    
    // Step 1: Fetch the index sheet to get batch years and their sheet links
    const indexCsvUrl = `https://docs.google.com/spreadsheets/d/${INDEX_SHEET_ID}/export?format=csv&gid=${INDEX_GID}`;
    const indexResponse = await fetch(indexCsvUrl);
    
    if (!indexResponse.ok) {
      throw new Error(`Failed to fetch index sheet: ${indexResponse.status}`);
    }
    
    const indexCsv = await indexResponse.text();
    const batches = parseBatchIndex(indexCsv);
    console.log(`Found ${batches.length} batches:`, batches.map(b => b.batch));
    
    // Step 2: Fetch data from each batch sheet
    const allAlumni: Alumni[] = [];
    
    for (const batchInfo of batches) {
      try {
        const students = await fetchBatchData(batchInfo);
        allAlumni.push(...students);
        console.log(`Fetched ${students.length} students from batch ${batchInfo.batch}`);
      } catch (err) {
        console.error(`Error fetching batch ${batchInfo.batch}:`, err);
      }
    }
    
    console.log(`Total alumni fetched: ${allAlumni.length}`);
    
    return new Response(JSON.stringify({ alumni: allAlumni, batches: batches.map(b => b.batch) }), {
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

function parseBatchIndex(csvText: string): BatchInfo[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const batches: BatchInfo[] = [];
  
  // Skip header row (batch, link)
  for (let i = 1; i < lines.length; i++) {
    const columns = parseCSVLine(lines[i]);
    const batch = columns[0]?.trim();
    const sheetUrl = columns[1]?.trim();
    
    if (batch && sheetUrl && sheetUrl.includes('docs.google.com')) {
      batches.push({ batch, sheetUrl });
    }
  }
  
  return batches;
}

async function fetchBatchData(batchInfo: BatchInfo): Promise<Alumni[]> {
  // Extract sheet ID and gid from the URL
  const sheetIdMatch = batchInfo.sheetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const gidMatch = batchInfo.sheetUrl.match(/gid=(\d+)/);
  
  if (!sheetIdMatch) {
    console.error(`Could not extract sheet ID from URL: ${batchInfo.sheetUrl}`);
    return [];
  }
  
  const sheetId = sheetIdMatch[1];
  const gid = gidMatch ? gidMatch[1] : '0';
  
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const response = await fetch(csvUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch batch sheet: ${response.status}`);
  }
  
  const csvText = await response.text();
  return parseStudentData(csvText, batchInfo.batch);
}

function parseStudentData(csvText: string, batch: string): Alumni[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const alumni: Alumni[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const columns = parseCSVLine(lines[i]);
    
    // Columns: S.NO, Roll number, Name, Contact, Email (or similar)
    // Try to find roll number, name, and email
    if (columns.length >= 3) {
      // Find columns by checking content patterns
      let rollNo = '';
      let name = '';
      let email = '';
      
      for (let j = 0; j < columns.length; j++) {
        const col = columns[j]?.trim() || '';
        
        // Roll number pattern (like 20891A1201)
        if (!rollNo && /^\d{2}[A-Z0-9]+$/i.test(col)) {
          rollNo = col;
        }
        // Email pattern
        else if (!email && col.includes('@') && col.includes('.')) {
          email = col;
        }
        // Name - usually the column after roll number, not a number, not email
        else if (!name && rollNo && col && !/^\d+$/.test(col) && !col.includes('@') && col.length > 2) {
          name = col;
        }
      }
      
      // Fallback: assume standard column order (S.NO, Roll, Name, Contact, Email)
      if (!rollNo && columns[1]) rollNo = columns[1].trim();
      if (!name && columns[2]) name = columns[2].trim();
      if (!email && columns[4]) email = columns[4].trim();
      
      if (rollNo && name && rollNo !== 'Roll number' && name !== 'Name of the Student') {
        alumni.push({
          rollNo,
          name,
          email: email || '',
          batch
        });
      }
    }
  }
  
  return alumni;
}

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
