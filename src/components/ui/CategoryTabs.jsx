import React from 'react';
import { Store, Coffee, Cake, UtensilsCrossed, Clock, Gem, ShoppingBag } from "lucide-react";

const categories = [
  { id: 'all', label: 'All Places', icon: Store },
  { id: 'vintage_store', label: 'Vintage', icon: Clock },
  { id: 'antique_store', label: 'Antiques', icon: Gem },
  { id: 'thrift_store', label: 'Thrift', icon: ShoppingBag },
  { id: 'coffee_shop', label: 'Coffee', icon: Coffee },
  { id: 'bakery', label: 'Bakery', icon: Cake },
  { id: 'breakfast_place', label: 'Breakfast', icon: UtensilsCrossed },
];

export default function CategoryTabs({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map(cat => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              isActive 
                ? 'bg-stone-900 text-white shadow-lg' 
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}