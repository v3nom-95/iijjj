import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Briefcase, GraduationCap, ArrowRight, Award, Globe } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const Index = () => {
  const features = [
    {
      icon: Users,
      title: "Alumni Directory",
      description: "Connect with alumni from all batches. Find mentors, peers, and industry experts.",
    },
    {
      icon: MessageSquare,
      title: "Community Feed",
      description: "Share updates, job opportunities, and engage with fellow alumni and students.",
    },
    {
      icon: Briefcase,
      title: "Career Growth",
      description: "Access job referrals, mentorship, and guidance from successful alumni.",
    },
  ];

  const stats = [
    { value: "1000+", label: "Alumni Network" },
    { value: "50+", label: "Companies Represented" },
    { value: "15+", label: "Years of Excellence" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0iI2YzYjg0YyIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="container relative mx-auto px-4 pt-16 pb-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary mb-8 animate-fade-in">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Vignan Institute of Technology & Science</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Department of
              <span className="block text-gradient-gold">Information Technology</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              Connect, collaborate, and grow with our vibrant alumni community. 
              Building bridges between generations of IT excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/alumni">
                  <Users className="w-5 h-5 mr-2" />
                  Explore Alumni
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/community">
                  Join Community
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container relative mx-auto px-4 mt-16">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-slide-up"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <p className="font-display text-3xl md:text-4xl font-bold text-secondary">{stat.value}</p>
                <p className="text-sm md:text-base text-primary-foreground/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your Gateway to
              <span className="text-gradient-gold"> Professional Growth</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join a network of accomplished professionals and unlock opportunities that shape your career.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl bg-card border border-border shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0iI2YzYjg0YyIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20" />
        
        <div className="container relative mx-auto px-4 text-center">
          <Globe className="w-16 h-16 text-secondary mx-auto mb-6 animate-pulse" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Connect?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join thousands of alumni and students building meaningful professional relationships.
          </p>
          <Button variant="hero" size="xl" asChild>
            <Link to="/auth?mode=signup">
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="font-display font-bold text-foreground">VNITS Alumni Connect</p>
                <p className="text-sm text-muted-foreground">Department of Information Technology</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Vignan Institute of Technology & Science. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
