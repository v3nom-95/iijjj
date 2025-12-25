import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, GraduationCap, Mail, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Alumni {
  rollNo: string;
  name: string;
  email: string;
}

const Alumni = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('fetch-alumni');
        
        if (error) throw error;
        
        if (data?.alumni) {
          setAlumni(data.alumni);
        }
      } catch (err) {
        console.error('Error fetching alumni:', err);
        setError('Failed to load alumni data');
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  const filteredAlumni = alumni.filter((a) => {
    const query = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(query) ||
      a.email.toLowerCase().includes(query) ||
      a.rollNo.toLowerCase().includes(query)
    );
  });

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
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="relative flex-1 max-w-lg w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, email, or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>
        </div>
      </section>

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
                Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <Badge variant="secondary" className="text-sm">
                  Showing {filteredAlumni.length} of {alumni.length} students
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAlumni.map((a, index) => (
                  <Card 
                    key={a.rollNo}
                    className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in border-border"
                    style={{ animationDelay: `${Math.min(index * 0.02, 0.5)}s` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-secondary font-display font-bold text-lg">
                        {a.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                      </div>
                      <CardTitle className="font-display text-lg mt-3 capitalize">
                        {a.name.toLowerCase()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Hash className="w-4 h-4 flex-shrink-0" />
                          <span className="font-mono">{a.rollNo}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <a 
                            href={`mailto:${a.email}`}
                            className="hover:text-primary transition-colors break-all"
                          >
                            {a.email.toLowerCase()}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Info Card */}
          <Card className="mt-12 gradient-hero text-primary-foreground border-0">
            <CardContent className="p-8 text-center">
              <h3 className="font-display text-2xl font-bold mb-3">
                Data Powered by Google Sheets
              </h3>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto">
                Our alumni directory is synced directly from the official IT Department database,
                ensuring up-to-date information for all students.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Alumni;
