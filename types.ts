
export interface Product {
  id: string;
  name: string;
  price: number;
  platform: 'Amazon India' | 'Meesho' | 'Savana' | 'Nike India' | 'Myntra' | 'Flipkart' | 'H&M India' | 'Adidas India' | 'Max Fashion' | 'Ajio' | 'Puma India' | string;
  imageUrl: string;
  buyLink: string;
  category: string;
  isExactMatch: boolean;
  isAlternative?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface GalleryItem {
  id: string;
  userImage: string;
  outfitImage: string;
  resultImage: string;
  date: string;
  products: Product[];
  chatHistory: ChatMessage[];
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  GALLERY = 'GALLERY'
}
