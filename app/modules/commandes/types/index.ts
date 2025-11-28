export type Commande = {
  id: number;
  id_user: number;
  id_restaurant: number;
  total_price: number;
  status: 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
};