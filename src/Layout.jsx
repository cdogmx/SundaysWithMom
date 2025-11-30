import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Home, MapPin, Calendar, User, LogIn, Menu, X, 
  Plus, Shield, Store, Heart, MessageCircle
} from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Layout({ children, currentPageName }) {
  const { user, isAuthenticated, isLoading: isLoadingAuth, logout, navigateToLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    navigateToLogin();
  };

  const handleLogout = () => {
    logout(true);
  };

  const navLinks = [
    { name: 'Home', page: 'Home', icon: Home },
    { name: 'Directory', page: 'Directory', icon: MapPin },
    { name: 'Events', page: 'Events', icon: Calendar },
  ];

  const isAdmin = user?.role === 'admin' || user?.is_admin;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692b2de5f3f6b84b38b533ab/6cdd48acb_SundaysWithMomLogo.png" 
                alt="Sunday's With Mom" 
                className="h-8 sm:h-10"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => {
                const Icon = link.icon;
                const isActive = currentPageName === link.page;
                return (
                  <Link key={link.page} to={createPageUrl(link.page)}>
                    <Button 
                      variant="ghost" 
                      className={`rounded-full ${isActive ? 'bg-stone-100 text-stone-900' : 'text-stone-600'}`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {link.name}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              {!isLoadingAuth && (
                <>
                  {isAuthenticated && user ? (
                            <>
                              <NotificationBell user={user} />
                              <Link to={createPageUrl('AddLocation')} className="hidden md:block">
                                <Button variant="outline" size="sm" className="rounded-full">
                                  <Plus className="h-4 w-4 mr-1" /> Add Place
                                </Button>
                              </Link>
                              <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="rounded-full p-0 h-10 w-10">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-stone-200 text-stone-600">
                                {(user.display_name || user.full_name || 'U')[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl('Profile')} className="flex items-center">
                              <User className="h-4 w-4 mr-2" /> Profile
                            </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                            <Link to={createPageUrl('Messages')} className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-2" /> Messages
                            </Link>
                            </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl('AddLocation')} className="flex items-center">
                              <Store className="h-4 w-4 mr-2" /> Add Place
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl('AddEvent')} className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" /> Post Event
                            </Link>
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link to={createPageUrl('Admin')} className="flex items-center text-amber-600">
                                  <Shield className="h-4 w-4 mr-2" /> Admin
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout} className="text-stone-500">
                            Sign Out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <Button onClick={handleLogin} className="rounded-full">
                      <LogIn className="h-4 w-4 mr-2" /> Sign In
                    </Button>
                  )}
                </>
              )}

              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white pb-4">
            <div className="px-4 pt-4 space-y-2">
              {navLinks.map(link => {
                const Icon = link.icon;
                const isActive = currentPageName === link.page;
                return (
                  <Link 
                    key={link.page} 
                    to={createPageUrl(link.page)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start rounded-xl ${isActive ? 'bg-stone-100' : ''}`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {link.name}
                    </Button>
                  </Link>
                );
              })}
              {user && (
                <>
                  <Link to={createPageUrl('AddLocation')} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start rounded-xl">
                      <Plus className="h-4 w-4 mr-3" />
                      Add Place
                    </Button>
                  </Link>
                  <Link to={createPageUrl('AddEvent')} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start rounded-xl">
                      <Calendar className="h-4 w-4 mr-3" />
                      Post Event
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692b2de5f3f6b84b38b533ab/6cdd48acb_SundaysWithMomLogo.png" 
              alt="Sunday's With Mom" 
              className="h-6"
            />
            <p className="text-sm text-stone-500 text-center">
              Your guide to perfect mornings with the people you love.
            </p>
            <div className="flex items-center gap-4 text-sm text-stone-500">
              <Link to={createPageUrl('Directory')} className="hover:text-stone-900">Directory</Link>
              <Link to={createPageUrl('Events')} className="hover:text-stone-900">Events</Link>
              <a href="mailto:info@ggappdev.com?subject=Sundays%20With%20Mom" className="hover:text-stone-900">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}