import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, GraduationCap, Mail, Hash, Calendar, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Alumni {
  rollNo: string;
  name: string;
  email: string;
  batch: string;
}

const Alumni = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Direct fetch from Google Sheets (fallback if edge function fails)
  const fetchAlumniDirect = async () => {
    try {
      console.log('Fetching alumni directly from Google Sheets...');
      const INDEX_SHEET_ID = '15levddFZV4KJov4wey-osN5Ul4Dzc7UYEH2Gb0Z83i8';
      const indexCsvUrl = `https://docs.google.com/spreadsheets/d/${INDEX_SHEET_ID}/export?format=csv&gid=0`;
      
      const indexResponse = await fetch(indexCsvUrl);
      if (!indexResponse.ok) {
        console.error('Failed to fetch index sheet');
        return null;
      }
      
      const indexCsv = await indexResponse.text();
      console.log('Index CSV fetched, parsing...');
      
      const lines = indexCsv.split('\n');
      let fixedLines = [];
      let i = 0;
      while (i < lines.length) {
        let line = lines[i];
        // Join multiline URLs
        while (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          const isContinuation = nextLine && !nextLine.includes(',') && !nextLine.match(/^\w+,/);
          if (isContinuation) {
            line += nextLine;
            i++;
          } else {
            break;
          }
        }
        fixedLines.push(line);
        i++;
      }
      
      const batchLines = fixedLines.filter(l => l.trim());
      const allAlumni: Alumni[] = [];
      
      // Parse batches and fetch each
      for (let i = 1; i < batchLines.length; i++) {
        const parts = batchLines[i].split(',');
        const batch = parts[0]?.trim();
        const sheetUrl = parts[1]?.trim();
        
        if (!batch || !sheetUrl || !sheetUrl.includes('docs.google.com')) continue;
        
        try {
          const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
          const gidMatch = sheetUrl.match(/gid=(\d+)/);
          
          if (!sheetIdMatch) continue;
          
          const sheetId = sheetIdMatch[1];
          const gid = gidMatch ? gidMatch[1] : '0';
          
          const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
          const csvResponse = await fetch(csvUrl);
          if (!csvResponse.ok) continue;
          
          const csvText = await csvResponse.text();
          const dataLines = csvText.split('\n').filter(l => l.trim());
          
          // Find header row
          let headerIdx = 0;
          for (let j = 0; j < Math.min(5, dataLines.length); j++) {
            if (dataLines[j].toLowerCase().includes('roll') || dataLines[j].toLowerCase().includes('name')) {
              headerIdx = j;
              break;
            }
          }
          
          const headers = dataLines[headerIdx].split(',').map(h => h.toLowerCase().trim());
          let rollNoIdx = -1, nameIdx = -1, emailIdx = -1;
          
          for (let k = 0; k < headers.length; k++) {
            const h = headers[k];
            if (h.includes('roll') || h.includes('no')) rollNoIdx = k;
            if (h.includes('name')) nameIdx = k;
            if (h.includes('email')) emailIdx = k;
          }
          
          // Parse students
          for (let j = headerIdx + 1; j < dataLines.length; j++) {
            const columns = dataLines[j].split(',');
            const rollNo = rollNoIdx >= 0 && columns[rollNoIdx] ? columns[rollNoIdx].trim() : '';
            const name = nameIdx >= 0 && columns[nameIdx] ? columns[nameIdx].trim() : '';
            const email = emailIdx >= 0 && columns[emailIdx] ? columns[emailIdx].trim() : '';
            
            if (!rollNo || !name) continue;
            
            allAlumni.push({
              rollNo,
              name,
              email: email || '',
              batch
            });
          }
          
          console.log(`Fetched ${allAlumni.filter(a => a.batch === batch).length} students from batch ${batch}`);
        } catch (err) {
          console.error(`Error fetching batch ${batch}:`, err);
        }
      }
      
      const batchList = [...new Set(allAlumni.map(a => a.batch))].sort((a, b) => b.localeCompare(a));
      return { alumni: allAlumni, batches: batchList };
    } catch (err) {
      console.error('Direct fetch error:', err);
      return null;
    }
  };

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try edge function first
        let data = null;
        try {
          const response = await supabase.functions.invoke('fetch-alumni');
          if (response.data) {
            data = response.data;
          }
        } catch (err) {
          console.warn('Edge function failed, trying direct fetch:', err);
        }
        
        // Fallback to direct fetch if edge function fails
        if (!data || !data.alumni) {
          data = await fetchAlumniDirect();
        }
        
        if (data?.alumni) {
          const sortedAlumni = [...data.alumni].sort((a, b) => {
            const batchCompare = b.batch.localeCompare(a.batch);
            if (batchCompare !== 0) return batchCompare;
            // Sort by roll number within each batch
            return a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true });
          });
          setAlumni(sortedAlumni);
        }
        
        if (data?.batches) {
          const sortedBatches = [...data.batches].sort((a, b) => b.localeCompare(a));
          setBatches(sortedBatches);
        }
      } catch (err) {
        console.error('Error fetching alumni:', err);
        setError('Failed to load alumni data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  const filteredAlumni = alumni.filter((a) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      a.name.toLowerCase().includes(query) ||
      a.email.toLowerCase().includes(query) ||
      a.rollNo.toLowerCase().includes(query);
    const matchesBatch = selectedBatch === "All" || a.batch === selectedBatch;
    return matchesSearch && matchesBatch;
  });

  const batchStats = batches.map(batch => ({
    batch,
    count: alumni.filter(a => a.batch === batch).length
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0iI2YzYjg0YyIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20" />
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary mb-6">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{alumni.length}+ Students</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Alumni Directory
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8">
              IT Department - VIGNAN Institute of Technology & Science
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-card border-b border-border sticky top-16 z-30 shadow-soft">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, email, or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Batch:</span>
              </div>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch} value={batch}>
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Batch Stats */}
      {batchStats.length > 0 && (
        <section className="py-6 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedBatch("All")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedBatch === "All"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:border-primary/50"
                }`}
              >
                <Users className="w-4 h-4" />
                All Batches
                <Badge variant="secondary" className="ml-1">{alumni.length}</Badge>
              </button>
              {batchStats.map((stat) => (
                <button
                  key={stat.batch}
                  onClick={() => setSelectedBatch(stat.batch)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    selectedBatch === stat.batch
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border hover:border-primary/50"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Batch {stat.batch}
                  <Badge variant="secondary" className="ml-1">{stat.count}</Badge>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Alumni Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-border">
                  <CardHeader className="pb-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <Skeleton className="h-5 w-3/4 mt-3" />
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <GraduationCap className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Error Loading Data
              </h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                No Alumni Found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <Badge variant="secondary" className="text-sm">
                  Showing {filteredAlumni.length} of {alumni.length} students
                </Badge>
              </div>
              
              {/* Group by batch */}
              {(selectedBatch === "All" ? batches : [selectedBatch]).map((batch) => {
                const batchAlumni = filteredAlumni.filter(a => a.batch === batch);
                if (batchAlumni.length === 0) return null;
                
                return (
                  <div key={batch} className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <h2 className="font-display text-2xl font-bold text-foreground">
                          Batch {batch}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {batchAlumni.length} students
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {batchAlumni.map((a, index) => (
                        <Card 
                          key={`${a.batch}-${a.rollNo}`}
                          className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in border-border"
                          style={{ animationDelay: `${Math.min(index * 0.02, 0.5)}s` }}
                        >
                          <CardHeader className="pb-3">
                            <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-secondary font-display font-bold text-lg">
                              {a.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                            </div>
                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground font-mono mb-1">{a.rollNo}</p>
                              <CardTitle className="font-display text-lg capitalize">
                                {a.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {a.email && (
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  <a 
                                    href={`mailto:${a.email}`}
                                    className="hover:text-primary transition-colors break-all"
                                  >
                                    {a.email.toLowerCase()}
                                  </a>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Info Card */}
          
        </div>
      </section>
    </div>
  );
};

export default Alumni;
