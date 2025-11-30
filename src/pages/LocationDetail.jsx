import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, Star, MapPin, Phone, Mail, Globe, Clock, 
  Navigation, Camera, Send, ArrowLeft, Tag
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const categoryLabels = {
  vintage_store: "Vintage Store",
  antique_store: "Antique Store",
  thrift_store: "Thrift Store",
  coffee_shop: "Coffee Shop",
  bakery: "Bakery",
  breakfast_place: "Breakfast Place"
};

export default function LocationDetail() {
  const [location, setLocation] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [deals, setDeals] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', photos: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const locationId = urlParams.get('id');

  useEffect(() => {
    loadData();
  }, [locationId]);

  const loadData = async () => {
    if (!locationId) return;
    
    setIsLoading(true);
    
    const [locationData, reviewsData, dealsData] = await Promise.all([
      base44.entities.Location.filter({ id: locationId }),
      base44.entities.Review.filter({ location_id: locationId }, '-created_date'),
      base44.entities.Deal.filter({ location_id: locationId, is_active: true })
    ]);
    
    setLocation(locationData[0]);
    setReviews(reviewsData);
    setDeals(dealsData);
    
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const userData = await base44.auth.me();
      setUser(userData);
    }
    
    setIsLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!user || !newReview.comment) return;
    
    setIsSubmitting(true);
    
    await base44.entities.Review.create({
      location_id: locationId,
      rating: newReview.rating,
      comment: newReview.comment,
      photos: newReview.photos,
      user_name: user.display_name || user.full_name || 'Anonymous',
      user_email: user.email
    });
    
    // Update location average rating
    const allReviews = [...reviews, { rating: newReview.rating }];
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await base44.entities.Location.update(locationId, {
      average_rating: avgRating,
      total_reviews: allReviews.length
    });
    
    // Create feed activity
    await base44.entities.FeedActivity.create({
      activity_type: 'new_review',
      title: `New review for ${location.name}`,
      description: newReview.comment,
      location_id: locationId,
      user_name: user.display_name || user.full_name || 'Anonymous',
      user_email: user.email
    });
    
    setNewReview({ rating: 5, comment: '', photos: [] });
    await loadData();
    setIsSubmitting(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewReview(prev => ({ ...prev, photos: [...prev.photos, file_url] }));
  };

  const getDirectionsUrl = () => {
    const address = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <MapPin className="h-16 w-16 mx-auto text-stone-300 mb-4" />
          <h2 className="text-xl font-medium text-stone-900 mb-2">Location not found</h2>
          <Link to={createPageUrl("Directory")}>
            <Button className="rounded-full">Back to Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96 bg-stone-200">
        {location.main_image ? (
          <img 
            src={location.main_image} 
            alt={location.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300">
            <span className="text-8xl font-light text-stone-400">{location.name[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <Link to={createPageUrl("Directory")} className="absolute top-4 left-4">
          <Button variant="secondary" size="icon" className="rounded-full bg-white/90 hover:bg-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10 pb-12">
        {/* Main Info Card */}
        <Card className="mb-6 overflow-hidden border-0 shadow-xl">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <Badge className="bg-stone-100 text-stone-700 mb-3">
                  {categoryLabels[location.category]}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-semibold text-stone-900 mb-2">
                  {location.name}
                </h1>
                <div className="flex items-center gap-3 text-stone-600">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="font-semibold">{location.average_rating?.toFixed(1) || 'New'}</span>
                  </div>
                  <span className="text-stone-400">•</span>
                  <span>{location.total_reviews || 0} reviews</span>
                </div>
              </div>
              
              <a 
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-stone-900 hover:bg-stone-800 rounded-full">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </a>
            </div>

            {location.bio && (
              <p className="text-stone-600 text-lg leading-relaxed mb-6">{location.bio}</p>
            )}

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-stone-100">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-stone-600">
                  <MapPin className="h-5 w-5 text-stone-400" />
                  <span>{location.address}, {location.city}, {location.state} {location.zip}</span>
                </div>
                {location.phone && (
                  <a href={`tel:${location.phone}`} className="flex items-center gap-3 text-stone-600 hover:text-stone-900">
                    <Phone className="h-5 w-5 text-stone-400" />
                    <span>{location.phone}</span>
                  </a>
                )}
                {location.email && (
                  <a href={`mailto:${location.email}`} className="flex items-center gap-3 text-stone-600 hover:text-stone-900">
                    <Mail className="h-5 w-5 text-stone-400" />
                    <span>{location.email}</span>
                  </a>
                )}
                {location.website && (
                  <a href={location.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-stone-600 hover:text-stone-900">
                    <Globe className="h-5 w-5 text-stone-400" />
                    <span>Visit Website</span>
                  </a>
                )}
              </div>
              
              {location.hours && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-stone-700 font-medium">
                    <Clock className="h-4 w-4" />
                    Hours of Operation
                  </div>
                  <div className="space-y-1 text-sm">
                    {daysOfWeek.map(day => (
                      <div key={day} className="flex justify-between text-stone-600">
                        <span className="capitalize">{day}</span>
                        <span>{location.hours[day] || 'Closed'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Deals */}
        {deals.length > 0 && (
          <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-amber-600" />
                Current Deals
              </h2>
              <div className="space-y-3">
                {deals.map(deal => (
                  <div key={deal.id} className="bg-white rounded-xl p-4">
                    <h3 className="font-medium text-stone-900">{deal.title}</h3>
                    {deal.description && <p className="text-sm text-stone-600 mt-1">{deal.description}</p>}
                    {deal.valid_until && (
                      <p className="text-xs text-stone-400 mt-2">
                        Valid until {format(new Date(deal.valid_until), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gallery */}
        {location.gallery_images?.length > 0 && (
          <Card className="mb-6 border-0 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {location.gallery_images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-6">Reviews</h2>
            
            {/* Add Review Form */}
            {user && (
              <div className="bg-stone-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`h-6 w-6 ${star <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                      />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Share your experience..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="mb-3 border-stone-200"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer hover:text-stone-900">
                    <Camera className="h-4 w-4" />
                    Add Photos
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  <Button 
                    onClick={handleSubmitReview} 
                    disabled={isSubmitting || !newReview.comment}
                    className="rounded-full"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Submit Review
                  </Button>
                </div>
                {newReview.photos.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {newReview.photos.map((photo, idx) => (
                      <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Review List */}
            {reviews.length === 0 ? (
              <p className="text-center text-stone-500 py-8">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-stone-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-medium">
                          {review.user_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-medium text-stone-900">{review.user_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-600">{review.comment}</p>
                    {review.photos?.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.photos.map((photo, idx) => (
                          <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden">
                            <img src={photo} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-stone-400 mt-2 block">
                      {format(new Date(review.created_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}