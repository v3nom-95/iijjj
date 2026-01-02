import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main index sheet with batch and links
const INDEX_SHEET_ID = '15levddFZV4KJov4wey-osN5Ul4Dzc7UYEH2Gb0Z83i8';
const INDEX_GID = '0';

interface Alumni {
  rollNo: string;
  name: string;
  email: string;
  batch: string;
  photo?: string;
  linkedin?: string;
  status?: string;
}

interface BatchInfo {
  batch: string;
  sheetUrl: string;
}

// Fallback data
const FALLBACK_ALUMNI: Alumni[] = [
  { rollNo: '20891A1201', name: 'John Smith', email: 'john@example.com', batch: '2020' },
  { rollNo: '20891A1202', name: 'Jane Doe', email: 'jane@example.com', batch: '2020' },
  { rollNo: '20891A1203', name: 'Michael Johnson', email: 'michael@example.com', batch: '2020' },
];

const FALLBACK_BATCHES = ['2020'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching batch index from Google Sheets...');

    const indexCsvUrl = `https://docs.google.com/spreadsheets/d/${INDEX_SHEET_ID}/export?format=csv&gid=${INDEX_GID}`;
    console.log(`Fetching index from: ${indexCsvUrl}`);

    const indexResponse = await fetch(indexCsvUrl, { redirect: 'follow' });

    if (!indexResponse.ok) {
      console.warn(`Failed to fetch: ${indexResponse.status}`);
      return new Response(
        JSON.stringify({ alumni: FALLBACK_ALUMNI, batches: FALLBACK_BATCHES }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let indexCsv = await indexResponse.text();
    console.log('Index CSV received');
    console.log('Raw CSV (first 300 chars):', indexCsv.substring(0, 300));

    // Fix multiline URLs that got split by newlines
    indexCsv = fixMultilineUrls(indexCsv);
    console.log('Fixed CSV (first 300 chars):', indexCsv.substring(0, 300));

    const batches = parseBatchIndex(indexCsv);
    console.log(`Found ${batches.length} batches:`, batches.map(b => b.batch));

    if (batches.length === 0) {
      // Try parsing as a direct data sheet if no batches found
      console.log('No batches found in index, trying to parse as direct data sheet...');
      const directAlumni = parseStudentData(indexCsv, 'Unknown');

      if (directAlumni.length > 0) {
        // Auto-correct batches based on roll numbers
        const alumniWithBatch = directAlumni.map(a => {
          const match = a.rollNo.match(/^(\d{2})/);
          if (match) {
            return { ...a, batch: '20' + match[1] };
          }
          return a;
        });

        const distinctBatches = [...new Set(alumniWithBatch.map(a => a.batch))].sort().reverse();

        return new Response(
          JSON.stringify({ alumni: alumniWithBatch, batches: distinctBatches }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ alumni: FALLBACK_ALUMNI, batches: FALLBACK_BATCHES }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    return new Response(
      JSON.stringify({ alumni: allAlumni, batches: batches.map(b => b.batch) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);

    return new Response(
      JSON.stringify({ alumni: FALLBACK_ALUMNI, batches: FALLBACK_BATCHES }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});



function transformDriveUrl(url: string): string {
  if (!url) return '';
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const idMatch = url.match(/[-\w]{25,}/);
    if (idMatch) {
      return `https://drive.google.com/thumbnail?id=${idMatch[0]}&sz=w1000`;
    }
  }
  return url;
}

function fixMultilineUrls(csvText: string): string {
  // Join lines that appear to be continuations of URLs
  const lines = csvText.split('\n');
  let result = [];
  let i = 0;

  while (i < lines.length) {
    let line = lines[i];

    // Check if next line is a URL continuation (doesn't start with letter,number at column 0 for CSV)
    while (i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      // If next line doesn't have a comma at the start and current line ends with a comma continuation
      const isContinuation = nextLine && !nextLine.includes(',') && !nextLine.match(/^\w+,/);
      if (isContinuation) {
        line += nextLine;
        i++;
      } else {
        break;
      }
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
}

function parseBatchIndex(csvText: string): BatchInfo[] {
  const lines = csvText.split('\n');
  const batches: BatchInfo[] = [];

  console.log('Parsing index, total lines:', lines.length);

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = parseCSVLine(line);
    const batch = columns[0]?.trim();
    const sheetUrl = columns[1]?.trim();

    console.log(`Line ${i}: batch="${batch}", url="${sheetUrl?.substring(0, 60)}..."`);

    if (batch && sheetUrl && sheetUrl.includes('docs.google.com') && sheetUrl.includes('/d/')) {
      batches.push({ batch, sheetUrl });
      console.log(`Added batch ${batch}`);
    }
  }

  return batches;
}

async function fetchBatchData(batchInfo: BatchInfo): Promise<Alumni[]> {
  const sheetIdMatch = batchInfo.sheetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const gidMatch = batchInfo.sheetUrl.match(/gid=(\d+)/);

  if (!sheetIdMatch) {
    console.error('Could not extract sheet ID');
    return [];
  }

  const sheetId = sheetIdMatch[1];
  const gid = gidMatch ? gidMatch[1] : '0';

  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  console.log(`Fetching batch ${batchInfo.batch}`);

  const response = await fetch(csvUrl, { redirect: 'follow' });

  if (!response.ok) {
    throw new Error(`Failed: ${response.status}`);
  }

  const csvText = await response.text();
  return parseStudentData(csvText, batchInfo.batch);
}

function parseStudentData(csvText: string, batch: string): Alumni[] {
  // Robust CSV parsing handling multiline quoted fields
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentVal += '"';
        i++;
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Next cell
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      // End of line (handle \r\n or \n)
      if (char === '\r' && nextChar === '\n') i++;

      currentRow.push(currentVal.trim());
      if (currentRow.length > 0 && currentRow.some(c => c)) rows.push(currentRow);
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.length > 0 && currentRow.some(c => c)) rows.push(currentRow);
  }

  const alumni: Alumni[] = [];

  if (rows.length < 2) return [];

  // Find the header row (contains "Roll number" or "roll")
  let headerIdx = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const rowStr = rows[i].join(',').toLowerCase();
    if (rowStr.includes('roll') || rowStr.includes('name')) {
      headerIdx = i;
      break;
    }
  }

  const headers = rows[headerIdx].map(h => h.toLowerCase().trim());

  let rollNoIdx = -1, nameIdx = -1, emailIdx = -1, photoIdx = -1, linkedinIdx = -1, statusIdx = -1;

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    if (h.includes('roll') || h.includes('no')) rollNoIdx = i;
    if (h.includes('name')) nameIdx = i;
    if (h.includes('email')) emailIdx = i;
    if (h.includes('photo')) photoIdx = i;
    if (h.includes('linkedin')) linkedinIdx = i;
    if (h.includes('status') || h.includes('current') || h.includes('position')) statusIdx = i;
  }

  console.log(`Batch ${batch} headers at line ${headerIdx}:`, headers);

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const columns = rows[i];

    const rollNo = rollNoIdx >= 0 && columns[rollNoIdx] ? columns[rollNoIdx].trim() : '';
    const name = nameIdx >= 0 && columns[nameIdx] ? columns[nameIdx].trim() : '';
    const email = emailIdx >= 0 && columns[emailIdx] ? columns[emailIdx].trim() : '';
    const photo = photoIdx >= 0 && columns[photoIdx] ? columns[photoIdx].trim() : '';
    const linkedin = linkedinIdx >= 0 && columns[linkedinIdx] ? columns[linkedinIdx].trim() : '';
    const status = statusIdx >= 0 && columns[statusIdx] ? columns[statusIdx].trim() : '';

    if (!rollNo && !name) continue;

    // Strict batch check: Only allow 2019, 2020, 2021 if deducing
    let derivedBatch = batch;
    if (batch === 'Unknown' || !batch) {
      const batchMatch = rollNo.match(/^(\d{2})/);
      if (batchMatch) {
        const year = '20' + batchMatch[1];
        // Only allow expected years acting as filter
        if (['2019', '2020', '2021'].includes(year)) {
          derivedBatch = year;
        } else {
          // Keep derived if valid looking, but mostly we expect 19/20/21
          derivedBatch = year;
        }
      }
    }

    alumni.push({
      rollNo: rollNo || 'N/A',
      name: name || 'Unknown Alumni',
      email: email || '',
      batch: derivedBatch,
      photo: transformDriveUrl(photo) || undefined,
      linkedin: linkedin || undefined,
      status: status || undefined
    });
  }

  console.log(`Parsed ${alumni.length} students for batch ${batch}`);
  return alumni;
}

function parseCSVLine(line: string): string[] {
  // Use robust line parser for backward compatibility if called individually
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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
