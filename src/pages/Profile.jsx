import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, User, Store, Settings, LogOut, Tag, Plus, Gift, Check, Heart, MessageCircle, Bell, EyeOff, Flag } from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LocationCard from "@/components/locations/LocationCard";
import EventCard from "@/components/events/EventCard";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myLocations, setMyLocations] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [claimedLocation, setClaimedLocation] = useState(null);
  const [deals, setDeals] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [myFavorites, setMyFavorites] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [hiddenContent, setHiddenContent] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    profile_type: 'shopper'
  });
  const [newDeal, setNewDeal] = useState({ title: '', description: '', valid_until: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    
    const userData = await base44.auth.me();
    setUser(userData);
    setFormData({
      display_name: userData.display_name || userData.full_name || '',
      bio: userData.bio || '',
      profile_type: userData.profile_type || 'shopper'
    });
    
    // Load user's submissions, offers, favorites, reviews, hidden content, and reports
    const [locations, events, offers, favorites, reviews, hidden, reports, allConvos, allMessages] = await Promise.all([
      base44.entities.Location.filter({ created_by: userData.email }),
      base44.entities.Event.filter({ created_by: userData.email }),
      base44.entities.Offer.filter({ recipient_email: userData.email }, '-created_date'),
      base44.entities.Favorite.filter({ user_email: userData.email }),
      base44.entities.Review.filter({ user_email: userData.email }, '-created_date'),
      base44.entities.HiddenContent.filter({ user_email: userData.email }),
      base44.entities.Report.filter({ reporter_email: userData.email }, '-created_date'),
      base44.entities.Conversation.list(),
      base44.entities.Message.list()
    ]);
    
    setMyReviews(reviews);
    setHiddenContent(hidden);
    setMyReports(reports);
    
    // Count unread messages
    const myConvos = Array.isArray(allConvos) ? allConvos.filter(c => c && c.participant_emails?.includes(userData.email)) : [];
    const messages = Array.isArray(allMessages) ? allMessages : [];
    const unread = messages.filter(m => 
      m && myConvos.some(c => c.id === m.conversation_id) && 
      !m.is_read && 
      m.sender_email !== userData.email
    ).length;
    setUnreadMessages(unread);
    
    setMyLocations(locations);
    setMyEvents(events);
    setMyOffers(offers);
    
    // Load favorite locations
    if (favorites.length > 0) {
      const favoriteLocations = await Promise.all(
        favorites.map(f => base44.entities.Location.filter({ id: f.location_id }))
      );
      setMyFavorites(favoriteLocations.flat().filter(Boolean));
    }
    
    // Load claimed location and deals for business profiles
    if (userData.claimed_location_id) {
      const claimedData = await base44.entities.Location.filter({ id: userData.claimed_location_id });
      setClaimedLocation(claimedData[0]);
      
      const dealsData = await base44.entities.Deal.filter({ location_id: userData.claimed_location_id });
      setDeals(dealsData);
    }
    
    setIsLoading(false);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await base44.auth.updateMe(formData);
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ avatar: file_url });
    setUser(prev => ({ ...prev, avatar: file_url }));
  };

  const handleAddDeal = async () => {
    if (!newDeal.title || !claimedLocation) return;
    
    await base44.entities.Deal.create({
      location_id: claimedLocation.id,
      ...newDeal,
      is_active: true
    });
    
    // Create feed activity
    await base44.entities.FeedActivity.create({
      activity_type: 'deal_posted',
      title: `New deal at ${claimedLocation.name}: ${newDeal.title}`,
      description: newDeal.description,
      location_id: claimedLocation.id,
      user_name: user.display_name || user.full_name,
      user_email: user.email
    });
    
    setNewDeal({ title: '', description: '', valid_until: '' });
    await loadProfile();
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl('Home'));
  };

  const handleRedeemOffer = async (offerId) => {
    await base44.entities.Offer.update(offerId, { is_redeemed: true });
    setMyOffers(prev => prev.map(o => o.id === offerId ? { ...o, is_redeemed: true } : o));
  };

  const markOfferAsRead = async (offerId) => {
    await base44.entities.Offer.update(offerId, { is_read: true });
    setMyOffers(prev => prev.map(o => o.id === offerId ? { ...o, is_read: true } : o));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-stone-100">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-stone-200 text-stone-600 text-2xl">
                    {(user.display_name || user.full_name || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-1.5 bg-stone-900 rounded-full cursor-pointer hover:bg-stone-800 transition-colors">
                  <Upload className="h-4 w-4 text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-semibold text-stone-900">{user.display_name || user.full_name}</h1>
                <p className="text-stone-500">{user.email}</p>
                <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-sm bg-stone-100 text-stone-700 capitalize">
                  {user.profile_type === 'business' ? <Store className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  {user.profile_type || 'Shopper'} Profile
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link to={createPageUrl('Messages')}>
                  <Button variant="outline" className="rounded-full relative">
                    <MessageCircle className="h-4 w-4 mr-2" /> Messages
                    {unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadMessages}
                      </span>
                    )}
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleLogout} className="rounded-full text-stone-600">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-full shadow-sm flex-wrap gap-1">
            <TabsTrigger value="settings" className="rounded-full">
              <Settings className="h-4 w-4 mr-2" /> Settings
            </TabsTrigger>
            <TabsTrigger value="favorites" className="rounded-full">
              <Heart className="h-4 w-4 mr-2" /> Favorites
            </TabsTrigger>
            <TabsTrigger value="offers" className="rounded-full relative">
              <Gift className="h-4 w-4 mr-2" /> Offers
              {myOffers.filter(o => !o.is_read).length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                  {myOffers.filter(o => !o.is_read).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="submissions" className="rounded-full">
              <Store className="h-4 w-4 mr-2" /> Content
            </TabsTrigger>
            <TabsTrigger value="hidden" className="rounded-full">
              <EyeOff className="h-4 w-4 mr-2" /> Hidden
            </TabsTrigger>
            <TabsTrigger value="reports" className="rounded-full">
              <Flag className="h-4 w-4 mr-2" /> Reports
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-full">
              <Bell className="h-4 w-4 mr-2" /> Alerts
            </TabsTrigger>
            {user.profile_type === 'business' && claimedLocation && (
              <TabsTrigger value="business" className="rounded-full">
                <Tag className="h-4 w-4 mr-2" /> Business
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="settings">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-stone-100">
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label>Display Name</Label>
                  <Input
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Profile Type</Label>
                  <Select 
                    value={formData.profile_type} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, profile_type: v }))}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shopper">Shopper</SelectItem>
                      <SelectItem value="business">Business Owner</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-stone-500 mt-1">
                    Business owners can claim their business listing and post deals.
                  </p>
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving} className="rounded-full">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-stone-100">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  My Favorite Places
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {myFavorites.length === 0 ? (
                  <div className="text-center py-8 text-stone-500">
                    <Heart className="h-12 w-12 mx-auto text-stone-300 mb-3" />
                    <p>No favorites yet!</p>
                    <p className="text-sm">Tap the heart on any business to save it here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myFavorites.map(loc => (
                      <LocationCard key={loc.id} location={loc} currentUser={user} onFavoriteChange={loadProfile} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-stone-100">
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-rose-500" />
                  Personalized Offers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {myOffers.length === 0 ? (
                  <div className="text-center py-8 text-stone-500">
                    <Gift className="h-12 w-12 mx-auto text-stone-300 mb-3" />
                    <p>No offers yet!</p>
                    <p className="text-sm">Businesses will send you personalized offers here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myOffers.map(offer => (
                      <div 
                        key={offer.id} 
                        className={`p-4 rounded-xl border-2 transition-all ${
                          offer.is_redeemed 
                            ? 'bg-stone-50 border-stone-200 opacity-60' 
                            : !offer.is_read 
                              ? 'bg-rose-50 border-rose-200' 
                              : 'bg-white border-stone-200'
                        }`}
                        onClick={() => !offer.is_read && markOfferAsRead(offer.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-stone-900">{offer.title}</h4>
                              {!offer.is_read && (
                                <span className="px-2 py-0.5 text-xs bg-rose-500 text-white rounded-full">New</span>
                              )}
                              {offer.is_redeemed && (
                                <span className="px-2 py-0.5 text-xs bg-emerald-500 text-white rounded-full flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Redeemed
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-stone-600 mb-2">{offer.description}</p>
                            <div className="flex items-center gap-4 text-xs text-stone-500">
                              <span>From: <strong>{offer.location_name}</strong></span>
                              {offer.valid_until && (
                                <span>Valid until: {format(new Date(offer.valid_until), 'MMM d, yyyy')}</span>
                              )}
                            </div>
                            {offer.discount_code && (
                              <div className="mt-3 inline-block px-3 py-1.5 bg-stone-100 rounded-lg font-mono text-sm">
                                Code: <strong>{offer.discount_code}</strong>
                              </div>
                            )}
                          </div>
                          {!offer.is_redeemed && (
                            <Button 
                              size="sm" 
                              onClick={(e) => { e.stopPropagation(); handleRedeemOffer(offer.id); }}
                              className="rounded-full bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Check className="h-4 w-4 mr-1" /> Redeem
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-stone-900">My Places</h3>
                <Link to={createPageUrl("AddLocation")}>
                  <Button size="sm" className="rounded-full">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </Link>
              </div>
              {myLocations.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center text-stone-500">
                    You haven't added any places yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myLocations.map(loc => (
                    <LocationCard key={loc.id} location={loc} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-stone-900">My Events</h3>
                <Link to={createPageUrl("AddEvent")}>
                  <Button size="sm" className="rounded-full">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </Link>
              </div>
              {myEvents.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center text-stone-500">
                    You haven't posted any events yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-stone-900 mb-4">My Reviews ({myReviews.length})</h3>
              {myReviews.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center text-stone-500">
                    You haven't written any reviews yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {myReviews.map(review => (
                    <Card key={review.id} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? 'text-amber-400' : 'text-stone-200'}>★</span>
                          ))}
                        </div>
                        <p className="text-stone-700">{review.comment}</p>
                        <p className="text-xs text-stone-400 mt-2">{format(new Date(review.created_date), 'MMM d, yyyy')}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="hidden">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-stone-100">
                <CardTitle className="flex items-center gap-2">
                  <EyeOff className="h-5 w-5 text-stone-500" />
                  Hidden Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {hiddenContent.length === 0 ? (
                  <div className="text-center py-8 text-stone-500">
                    <EyeOff className="h-12 w-12 mx-auto text-stone-300 mb-3" />
                    <p>No hidden content</p>
                    <p className="text-sm">Content you hide will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hiddenContent.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                        <div>
                          <span className="text-sm font-medium text-stone-700 capitalize">{item.content_type}</span>
                          <p className="text-xs text-stone-500">ID: {item.content_id}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await base44.entities.HiddenContent.delete(item.id);
                            setHiddenContent(prev => prev.filter(h => h.id !== item.id));
                          }}
                          className="text-stone-500 hover:text-stone-700"
                        >
                          Unhide
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-stone-100">
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-red-500" />
                  My Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {myReports.length === 0 ? (
                  <div className="text-center py-8 text-stone-500">
                    <Flag className="h-12 w-12 mx-auto text-stone-300 mb-3" />
                    <p>No reports submitted</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myReports.map(report => (
                      <div key={report.id} className="p-4 bg-stone-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-stone-900">{report.content_title}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            report.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            report.status === 'reviewed' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-stone-100 text-stone-600'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-stone-600">{report.reason}</p>
                        <p className="text-xs text-stone-400 mt-2">{format(new Date(report.created_date), 'MMM d, yyyy')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-stone-100">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-500" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-stone-600 mb-4">Manage your event subscriptions and notification preferences.</p>
                <Link to={createPageUrl('NotificationSettings')}>
                  <Button className="rounded-full">
                    <Bell className="h-4 w-4 mr-2" />
                    Manage Notifications
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {user.profile_type === 'business' && claimedLocation && (
            <TabsContent value="business" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-stone-100">
                  <CardTitle>{claimedLocation.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Link to={createPageUrl(`LocationDetail?id=${claimedLocation.id}`)}>
                    <Button variant="outline" className="rounded-full mb-4">
                      View Public Listing
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-stone-100">
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-amber-600" />
                    Manage Deals
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Deal title"
                      value={newDeal.title}
                      onChange={(e) => setNewDeal(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <Input
                      placeholder="Description"
                      value={newDeal.description}
                      onChange={(e) => setNewDeal(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <Input
                      type="date"
                      value={newDeal.valid_until}
                      onChange={(e) => setNewDeal(prev => ({ ...prev, valid_until: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleAddDeal} className="rounded-full">
                    <Plus className="h-4 w-4 mr-2" /> Add Deal
                  </Button>
                  
                  {deals.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h4 className="font-medium text-stone-900">Active Deals</h4>
                      {deals.map(deal => (
                        <div key={deal.id} className="p-4 bg-stone-50 rounded-xl">
                          <h5 className="font-medium">{deal.title}</h5>
                          {deal.description && <p className="text-sm text-stone-600">{deal.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}