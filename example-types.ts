// Example TypeScript interfaces for testing PhonyPony

interface Pony {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  tags: string[];
  profile: PonyProfile;
}

interface PonyProfile {
  bio: string;
  age: number;
  website: string;
  socialLinks: string[];
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  inStock: boolean;
  category: Category;
  reviews: Review[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  ponyId: number;
  createdAt: Date;
}

interface Order {
  id: number;
  ponyId: number;
  products: Product[];
  total: number;
  status: string;
  createdAt: Date;
  shippingAddress: Address;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
