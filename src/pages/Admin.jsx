import React, { useState, useEffect } from 'react';
import { stubAPI as base44 } from "@/api/stubs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Check, X, Trash2, Edit, Search, 
  MapPin, Calendar, Users, MessageSquare, Star,
  Shield, Eye, MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Admin email - change this to your admin email
const ADMIN_EMAIL = 'admin@sundayswithmom.com';

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editType, setEditType] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    
    const userData = await base44.auth.me();
    setUser(userData);
    
    // Check if user is admin
    if (userData.role !== 'admin' && !userData.is_admin) {
      navigate(createPageUrl('Home'));
      return;
    }
    
    await loadAllData();
    setIsLoading(false);
  };

  const loadAllData = async () => {
    const [locData, eventData, userData, reviewData, activityData] = await Promise.all([
      base44.entities.Location.list('-created_date'),
      base44.entities.Event.list('-created_date'),
      base44.entities.User.list('-created_date'),
      base44.entities.Review.list('-created_date', 50),
      base44.entities.FeedActivity.list('-created_date', 100)
    ]);
    
    setLocations(locData);
    setEvents(eventData);
    setUsers(userData);
    setReviews(reviewData);
    setActivities(activityData);
    
    setStats({
      totalLocations: locData.length,
      pendingLocations: locData.filter(l => !l.is_approved).length,
      totalEvents: eventData.length,
      pendingEvents: eventData.filter(e => !e.is_approved).length,
      totalUsers: userData.length,
      totalReviews: reviewData.length
    });
  };

  const handleApprove = async (type, id) => {
    if (type === 'location') {
      await base44.entities.Location.update(id, { is_approved: true });
    } else if (type === 'event') {
      await base44.entities.Event.update(id, { is_approved: true });
    }
    await loadAllData();
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    
    if (type === 'location') {
      await base44.entities.Location.delete(id);
    } else if (type === 'event') {
      await base44.entities.Event.delete(id);
    } else if (type === 'review') {
      await base44.entities.Review.delete(id);
    } else if (type === 'activity') {
      await base44.entities.FeedActivity.delete(id);
    }
    await loadAllData();
  };

  const handleToggleFeatured = async (id, currentValue) => {
    await base44.entities.Location.update(id, { is_featured: !currentValue });
    await loadAllData();
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editType) return;
    
    if (editType === 'location') {
      await base44.entities.Location.update(editingItem.id, editingItem);
    } else if (editType === 'event') {
      await base44.entities.Event.update(editingItem.id, editingItem);
    }
    
    setEditingItem(null);
    setEditType(null);
    await loadAllData();
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    await base44.entities.User.update(userId, { profile_type: newRole });
    await loadAllData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  const pendingLocations = locations.filter(l => !l.is_approved);
  const pendingEvents = events.filter(e => !e.is_approved);

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <div className="bg-stone-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <p className="text-stone-400 text-sm">Sundays with Mom</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-500">Total Locations</p>
                  <p className="text-2xl font-bold text-stone-900">{stats.totalLocations}</p>
                </div>
                <MapPin className="h-8 w-8 text-emerald-500 opacity-50" />
              </div>
              {stats.pendingLocations > 0 && (
                <Badge className="mt-2 bg-amber-100 text-amber-800">
                  {stats.pendingLocations} pending
                </Badge>
              )}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-500">Total Events</p>
                  <p className="text-2xl font-bold text-stone-900">{stats.totalEvents}</p>
                </div>
                <Calendar className="h-8 w-8 text-amber-500 opacity-50" />
              </div>
              {stats.pendingEvents > 0 && (
                <Badge className="mt-2 bg-amber-100 text-amber-800">
                  {stats.pendingEvents} pending
                </Badge>
              )}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-500">Users</p>
                  <p className="text-2xl font-bold text-stone-900">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-500">Reviews</p>
                  <p className="text-2xl font-bold text-stone-900">{stats.totalReviews}</p>
                </div>
                <Star className="h-8 w-8 text-rose-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals Alert */}
        {(pendingLocations.length > 0 || pendingEvents.length > 0) && (
          <Card className="border-0 shadow-sm bg-amber-50 mb-8">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-200 rounded-full">
                  <MessageSquare className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="font-medium text-amber-900">Pending Approvals</p>
                  <p className="text-sm text-amber-700">
                    {pendingLocations.length} locations and {pendingEvents.length} events waiting for review
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="locations" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-full shadow-sm">
            <TabsTrigger value="locations" className="rounded-full">
              <MapPin className="h-4 w-4 mr-2" /> Locations
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-full">
              <Calendar className="h-4 w-4 mr-2" /> Events
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-full">
              <Users className="h-4 w-4 mr-2" /> Users
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-full">
              <Star className="h-4 w-4 mr-2" /> Reviews
            </TabsTrigger>
            <TabsTrigger value="feed" className="rounded-full">
              <MessageSquare className="h-4 w-4 mr-2" /> Feed
            </TabsTrigger>
          </TabsList>

          {/* Locations Tab */}
          <TabsContent value="locations">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-stone-100">
                <div className="flex items-center justify-between">
                  <CardTitle>Manage Locations</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input
                      placeholder="Search locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-full"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-stone-100">
                  {locations
                    .filter(loc => loc.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(loc => (
                    <div key={loc.id} className="p-4 flex items-center justify-between hover:bg-stone-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200">
                          {loc.main_image && (
                            <img src={loc.main_image} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-stone-900">{loc.name}</h4>
                            {!loc.is_approved && (
                              <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                            )}
                            {loc.is_featured && (
                              <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
                            )}
                          </div>
                          <p className="text-sm text-stone-500">{loc.city}, {loc.state}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!loc.is_approved && (
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove('location', loc.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 rounded-full"
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(createPageUrl(`LocationDetail?id=${loc.id}`), '_blank')}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditingItem(loc); setEditType('location'); }}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFeatured(loc.id, loc.is_featured)}>
                              <Star className="h-4 w-4 mr-2" /> {loc.is_featured ? 'Unfeature' : 'Feature'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete('location', loc.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-stone-100">
                <CardTitle>Manage Events</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-stone-100">
                  {events.map(event => (
                    <div key={event.id} className="p-4 flex items-center justify-between hover:bg-stone-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-stone-900">{event.title}</h4>
                          {!event.is_approved && (
                            <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                          )}
                        </div>
                        <p className="text-sm text-stone-500">
                          {format(new Date(event.start_date), 'MMM d, yyyy')} • {event.city}, {event.state}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!event.is_approved && (
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove('event', event.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 rounded-full"
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => { setEditingItem(event); setEditType('event'); }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleDelete('event', event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-stone-100">
                <CardTitle>Manage Users</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-stone-100">
                  {users.map(u => (
                    <div key={u.id} className="p-4 flex items-center justify-between hover:bg-stone-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-medium">
                          {(u.display_name || u.full_name || u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium text-stone-900">{u.display_name || u.full_name || 'No name'}</h4>
                          <p className="text-sm text-stone-500">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select value={u.profile_type || 'shopper'} onValueChange={(v) => handleUpdateUserRole(u.id, v)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="shopper">Shopper</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-stone-100">
                <CardTitle>Manage Reviews</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-stone-100">
                  {reviews.map(review => (
                    <div key={review.id} className="p-4 hover:bg-stone-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-stone-900">{review.user_name}</span>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-stone-600">{review.comment}</p>
                          <p className="text-xs text-stone-400 mt-1">
                            {format(new Date(review.created_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleDelete('review', review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feed Tab */}
          <TabsContent value="feed">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-stone-100">
                <CardTitle>Feed Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-stone-100">
                  {activities.map(activity => (
                    <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-stone-50">
                      <div>
                        <h4 className="font-medium text-stone-900">{activity.title}</h4>
                        <p className="text-sm text-stone-500">
                          {activity.user_name} • {format(new Date(activity.created_date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-600"
                        onClick={() => handleDelete('activity', activity.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => { setEditingItem(null); setEditType(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {editType === 'location' ? 'Location' : 'Event'}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div>
                <Label>{editType === 'location' ? 'Name' : 'Title'}</Label>
                <Input
                  value={editType === 'location' ? editingItem.name : editingItem.title}
                  onChange={(e) => setEditingItem(prev => ({
                    ...prev,
                    [editType === 'location' ? 'name' : 'title']: e.target.value
                  }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>{editType === 'location' ? 'Bio' : 'Description'}</Label>
                <Textarea
                  value={editType === 'location' ? editingItem.bio : editingItem.description}
                  onChange={(e) => setEditingItem(prev => ({
                    ...prev,
                    [editType === 'location' ? 'bio' : 'description']: e.target.value
                  }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={editingItem.address}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, address: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>City</Label>
                  <Input
                    value={editingItem.city}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, city: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={editingItem.state}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, state: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>ZIP</Label>
                  <Input
                    value={editingItem.zip}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, zip: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingItem(null); setEditType(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}