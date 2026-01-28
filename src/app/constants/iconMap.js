// Icon mapping untuk categories
import {
  Coffee,
  UtensilsCrossed,
  Pizza,
  IceCream,
  Wine,
  Sandwich,
  Salad,
  Soup,
  CakeSlice,
  Cookie,
  Milk,
  Beer,
  Martini,
  Apple,
  Beef,
  Fish,
  Egg,
  Croissant,
  CupSoda,
  Popcorn,
} from 'lucide-react';

// Daftar icon yang tersedia
export const CATEGORY_ICONS = {
  Coffee,
  UtensilsCrossed,
  Pizza,
  IceCream,
  Wine,
  Sandwich,
  Salad,
  Soup,
  CakeSlice,
  Cookie,
  Milk,
  Beer,
  Martini,
  Apple,
  Beef,
  Fish,
  Egg,
  Croissant,
  CupSoda,
  Popcorn,
};

// Helper function: ambil icon component by name
export const getIconByName = (iconName) => {
  return CATEGORY_ICONS[iconName] || UtensilsCrossed; // default icon
};

// Helper function: ambil semua icon names
export const getIconNames = () => {
  return Object.keys(CATEGORY_ICONS);
};