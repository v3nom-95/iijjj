import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, LogOut, Menu, X, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Logo from "@/components/Logo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/alumni", label: "Alumni Directory", icon: Users },
    { path: "/community", label: "Community", icon: MessageSquare },
    { 
      path: "https://vitsitdepartment.vercel.app", 
      label: "Meet the Department", 
      icon: ExternalLink,
      external: true 
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="group">
            <Logo size="md" showText={true} showVaitLogo={true} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isExternal = link.external;
              const isCurrentPage = !isExternal && isActive(link.path);
              
              if (isExternal) {
                return (
                  <a
                    key={link.path}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <link.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </a>
                );
              }
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isCurrentPage
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/auth?mode=signup">Join Network</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isExternal = link.external;
                const isCurrentPage = !isExternal && isActive(link.path);
                
                if (isExternal) {
                  return (
                    <a
                      key={link.path}
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </a>
                  );
                }
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isCurrentPage
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-border mt-2">
                {user ? (
                  <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" className="w-full" asChild>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>Login</Link>
                    </Button>
                    <Button variant="hero" className="w-full" asChild>
                      <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>Join Network</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
