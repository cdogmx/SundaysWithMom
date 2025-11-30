import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Heart, ArrowRight, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import ReportDialog from "@/components/ReportDialog";

const categoryLabels = {
  vintage_store: "Vintage",
  antique_store: "Antiques",
  thrift_store: "Thrift",
  coffee_shop: "Coffee",
  bakery: "Bakery",
  breakfast_place: "Breakfast"
};

const categoryColors = {
  vintage_store: "bg-amber-100 text-amber-800",
  antique_store: "bg-stone-100 text-stone-800",
  thrift_store: "bg-teal-100 text-teal-800",
  coffee_shop: "bg-orange-100 text-orange-800",
  bakery: "bg-pink-100 text-pink-800",
  breakfast_place: "bg-yellow-100 text-yellow-800"
};

export default function LocationCard({ location, currentUser, onFavoriteChange, onHide }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  useEffect(() => {
    if (currentUser) {
      checkFavoriteStatus();
    }
  }, [currentUser, location.id]);

  const checkFavoriteStatus = async () => {
    const favorites = await base44.entities.Favorite.filter({ 
      user_email: currentUser.email, 
      location_id: location.id 
    });
    setIsFavorited(favorites.length > 0);
  };

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser || isToggling) return;
    
    setIsToggling(true);
    if (isFavorited) {
      const favorites = await base44.entities.Favorite.filter({ 
        user_email: currentUser.email, 
        location_id: location.id 
      });
      if (favorites[0]) {
        await base44.entities.Favorite.delete(favorites[0].id);
      }
      setIsFavorited(false);
    } else {
      await base44.entities.Favorite.create({
        user_email: currentUser.email,
        location_id: location.id
      });
      setIsFavorited(true);
    }
    setIsToggling(false);
    if (onFavoriteChange) onFavoriteChange();
  };

  return (
    <Link to={createPageUrl(`LocationDetail?id=${location.id}`)}>
      <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-white cursor-pointer h-full relative">
        <div className="relative aspect-[4/3] overflow-hidden">
          {location.main_image ? (
            <img 
              src={location.main_image} 
              alt={location.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
              <span className="text-4xl font-light text-stone-400">{location.name[0]}</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge className={`${categoryColors[location.category]} border-0 font-medium`}>
              {categoryLabels[location.category]}
            </Badge>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {location.is_featured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                ★ Featured
              </Badge>
            )}
            {currentUser && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFavorite}
                    className={`h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm ${isFavorited ? 'text-rose-500' : 'text-stone-400'}`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowReportDialog(true); }}
                    className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-sm text-stone-400 hover:text-red-500"
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              )}
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-1">
              {location.name}
            </h3>
            {location.average_rating > 0 && (
              <div className="flex items-center gap-1 text-amber-500 shrink-0">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium">{location.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 text-stone-500 text-sm mb-3">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{location.city}, {location.state}</span>
          </div>
          
          {location.bio && (
            <p className="text-sm text-stone-600 line-clamp-2 mb-3">{location.bio}</p>
          )}
          
          <div className="flex items-center justify-between pt-3 border-t border-stone-100">
            <span className="text-xs text-stone-400">
              {location.total_reviews || 0} reviews
            </span>
            <span className="text-sm font-medium text-stone-800 flex items-center gap-1 group-hover:gap-2 transition-all">
              View Details <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
        </Card>

        {currentUser && (
        <ReportDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          contentType="location"
          contentId={location.id}
          contentTitle={location.name}
          currentUser={currentUser}
          onHide={onHide}
        />
        )}
        </Link>
        );
        }