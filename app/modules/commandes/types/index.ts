export type Commande = {
  id: number;
  id_user: number;
  id_restaurant: number;
  items: Array<CommandeItem>;
  total_price: number;
  status: 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
};