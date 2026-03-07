export interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  badge: string;
  image: string;
  category:
    | "hair-accessories"
    | "bracelets"
    | "bag-charms"
    | "kids-jewelry"
    | "shoe-charms"
    | "rings"
    | "necklaces"
    | "earrings";
  description?: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Golden Bow Hair Clip",
    price: 24.99,
    rating: 4.8,
    reviews: 156,
    badge: "Trendy",
    image: "/images/HairAccesories.jpg",
    category: "hair-accessories",
    description: "Beautiful golden bow hair accessory with bees",
  },
  {
    id: 2,
    name: "Pink Charm Bracelet",
    price: 34.99,
    rating: 4.9,
    reviews: 203,
    badge: "Best Seller",
    image: "/images/bracelets-charm.jpg",
    category: "bracelets",
    description: "Handcrafted pink charm bracelet with heart",
  },
  {
    id: 3,
    name: "Floral Bag Charm",
    price: 19.99,
    rating: 4.7,
    reviews: 128,
    badge: "Popular",
    image: "/images/bag-charm.jpg",
    category: "bag-charms",
    description: "Cute floral knitted bag charm",
  },
  {
    id: 4,
    name: "Kids Jewelry Set",
    price: 29.99,
    rating: 4.6,
    reviews: 89,
    badge: "For Kids",
    image: "/images/kids-jelwelry.jpg",
    category: "kids-jewelry",
    description: "Safe and adorable jewelry for children",
  },
  {
    id: 5,
    name: "Red Shoe Charm",
    price: 22.99,
    rating: 4.8,
    reviews: 145,
    badge: "Exclusive",
    image: "/images/red-charm.jpg",
    category: "shoe-charms",
    description: "Elegant red knitted shoe charm with flowers",
  },
  {
    id: 6,
    name: "Diary Charm Collection",
    price: 27.99,
    rating: 4.9,
    reviews: 167,
    badge: "Popular",
    image: "/images/diary-charm.jpg",
    category: "bag-charms",
    description: "Beautiful diary charm with handcrafted details",
  },
  {
    id: 7,
    name: "Gold Diamond Ring",
    price: 89.99,
    rating: 4.5,
    reviews: 120,
    badge: "Popular",
    image: "/images/HairAccesories.jpg",
    category: "rings",
    description: "Elegant gold ring with diamond accent",
  },
  {
    id: 8,
    name: "Pearl Necklace Set",
    price: 129.99,
    rating: 4.8,
    reviews: 89,
    badge: "Best Seller",
    image: "/images/diary-charm.jpg",
    category: "necklaces",
    description: "Classic pearl necklace with matching earrings",
  },
];
