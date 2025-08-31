export type ProductRow = {
  product_url: string;
  product_name: string;
  product_category_tree: string;
  pid: string;
  retail_price?: string;
  discounted_price?: string;
  image: string;
  is_FK_Advantage_product?: string;
  description?: string;
  product_rating?: string;
  overall_rating?: string;
  brand?: string;
  product_specifications?: string;
};

export type IndexedProduct = {
  id: string;
  url: string;
  imageUrl: string;
  name: string;
  brand?: string;
  categoryPath?: string[];
  price?: number | null;
  discountedPrice?: number | null;
  rating?: number | null;
  overallRating?: number | null;
  description?: string;
  caption: string;
  embedding: number[];
};

export type SearchResult = IndexedProduct & { score: number };
