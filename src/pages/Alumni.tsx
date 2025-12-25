import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Users, Filter, Building, Calendar, GraduationCap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock alumni data - In production, this would come from Google Sheets API
const mockAlumniData = [
  { id: 1, name: "Rajesh Kumar", batch: "2019", company: "Google", designation: "Software Engineer", linkedin: "#" },
  { id: 2, name: "Priya Sharma", batch: "2019", company: "Microsoft", designation: "Product Manager", linkedin: "#" },
  { id: 3, name: "Arun Reddy", batch: "2020", company: "Amazon", designation: "SDE II", linkedin: "#" },
  { id: 4, name: "Sneha Patel", batch: "2020", company: "TCS", designation: "Tech Lead", linkedin: "#" },
  { id: 5, name: "Vikram Singh", batch: "2020", company: "Infosys", designation: "Consultant", linkedin: "#" },
  { id: 6, name: "Meera Nair", batch: "2021", company: "Wipro", designation: "Developer", linkedin: "#" },
  { id: 7, name: "Rahul Verma", batch: "2021", company: "Accenture", designation: "Analyst", linkedin: "#" },
  { id: 8, name: "Ananya Gupta", batch: "2021", company: "Deloitte", designation: "Consultant", linkedin: "#" },
  { id: 9, name: "Karthik Iyer", batch: "2019", company: "Meta", designation: "Staff Engineer", linkedin: "#" },
  { id: 10, name: "Divya Menon", batch: "2020", company: "Netflix", designation: "Senior Developer", linkedin: "#" },
];

const batchYears = ["All", "2019", "2020", "2021", "2022", "2023", "2024"];

const Alumni = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("All");

  const filteredAlumni = mockAlumniData.filter((alumni) => {
    const matchesSearch = 
      alumni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alumni.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = selectedBatch === "All" || alumni.batch === selectedBatch;
    return matchesSearch && matchesBatch;
  });

  const batchStats = batchYears.slice(1).map(year => ({
    year,
    count: mockAlumniData.filter(a => a.batch === year).length
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
              <span className="text-sm font-medium">{mockAlumniData.length}+ Alumni Connected</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Alumni Directory
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Explore our network of accomplished IT professionals across the globe.
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
                placeholder="Search by name, company, or role..."
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
                  {batchYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Batch Stats */}
      <section className="py-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {batchStats.map((stat) => (
              <button
                key={stat.year}
                onClick={() => setSelectedBatch(stat.year)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedBatch === stat.year
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:border-primary/50"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Batch {stat.year}
                <Badge variant="secondary" className="ml-1">{stat.count}</Badge>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredAlumni.length === 0 ? (
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAlumni.map((alumni, index) => (
                <Card 
                  key={alumni.id}
                  className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in border-border"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-secondary font-display font-bold text-lg">
                        {alumni.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {alumni.batch}
                      </Badge>
                    </div>
                    <CardTitle className="font-display text-lg mt-3">
                      {alumni.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="w-4 h-4" />
                        <span>{alumni.company}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {alumni.designation}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      asChild
                    >
                      <a href={alumni.linkedin} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Connect
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info Card */}
          <Card className="mt-12 gradient-hero text-primary-foreground border-0">
            <CardContent className="p-8 text-center">
              <h3 className="font-display text-2xl font-bold mb-3">
                Data Powered by Google Sheets
              </h3>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto">
                Our alumni directory is maintained through a collaborative Google Sheets database, 
                organized by batch year with individual sheet links for detailed information.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Alumni;
