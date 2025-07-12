-- First create a profile for the restaurant owner
INSERT INTO public.profiles (id, user_id, display_name, user_type, phone, address) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Sample Restaurant Owner', 'restaurant', '+234-800-000-0000', 'Lagos, Nigeria');

-- Insert sample Nigerian restaurants
INSERT INTO public.restaurants (id, owner_id, name, description, address, phone, email, cuisine_type, delivery_fee, min_order_amount, avg_delivery_time, rating, review_count, is_active, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Mama Ngozi Kitchen', 'Authentic Nigerian cuisine with traditional flavors', '123 Lagos Street, Victoria Island', '+234-123-456-7890', 'mamangozi@email.com', 'Nigerian', 500, 2000, 35, 4.5, 120, true, true),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Abuja Delights', 'Northern Nigerian specialties and local favorites', '456 Abuja Crescent, Garki', '+234-987-654-3210', 'abujaelights@email.com', 'Nigerian', 600, 1500, 40, 4.2, 85, true, true),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Calabar Kitchen', 'Cross River state delicacies and fresh seafood', '789 Calabar Road, Wuse II', '+234-555-123-4567', 'calabarkitchen@email.com', 'Nigerian', 700, 2500, 30, 4.7, 200, true, true);

-- Insert categories for Nigerian restaurants
INSERT INTO public.categories (id, restaurant_id, name, description, image_url, sort_order, is_active) VALUES
-- Mama Ngozi Kitchen categories
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Main Dishes', 'Traditional Nigerian main courses', NULL, 1, true),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Drinks', 'Refreshing beverages and traditional drinks', NULL, 2, true),

-- Abuja Delights categories  
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Main Dishes', 'Northern Nigerian specialties', NULL, 1, true),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Drinks', 'Cold and hot beverages', NULL, 2, true),

-- Calabar Kitchen categories
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'Main Dishes', 'Cross River delicacies', NULL, 1, true),
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'Drinks', 'Fresh juices and local drinks', NULL, 2, true);

-- Insert Nigerian main dishes for Mama Ngozi Kitchen
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, prep_time, is_available, is_featured, ingredients, allergens, sort_order) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Jollof Rice', 'Spicy rice cooked in tomato sauce with chicken', 2500, NULL, 25, true, true, ARRAY['Rice', 'Tomatoes', 'Onions', 'Chicken', 'Spices'], ARRAY['Gluten'], 1),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Pounded Yam & Egusi', 'Traditional pounded yam with melon seed soup', 3000, NULL, 30, true, true, ARRAY['Yam', 'Egusi', 'Palm oil', 'Meat', 'Fish'], ARRAY['Fish'], 2),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Fried Rice', 'Colorful fried rice with vegetables and protein', 2800, NULL, 20, true, false, ARRAY['Rice', 'Carrots', 'Green beans', 'Chicken'], NULL, 3),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Amala & Ewedu', 'Yam flour with jute leaf soup', 2200, NULL, 25, true, false, ARRAY['Yam flour', 'Ewedu', 'Locust beans'], NULL, 4),
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Pepper Soup', 'Spicy goat meat pepper soup', 3500, NULL, 35, true, true, ARRAY['Goat meat', 'Pepper soup spice', 'Utazi'], NULL, 5),
('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Moi Moi', 'Steamed bean pudding with egg and fish', 1500, NULL, 40, true, false, ARRAY['Black-eyed beans', 'Palm oil', 'Egg', 'Fish'], ARRAY['Fish', 'Eggs'], 6),
('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Suya', 'Grilled spiced beef skewers', 2000, NULL, 15, true, true, ARRAY['Beef', 'Suya spice', 'Onions'], NULL, 7),
('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Ofada Rice & Stew', 'Local rice with spicy pepper stew', 2700, NULL, 30, true, false, ARRAY['Ofada rice', 'Bell peppers', 'Meat', 'Palm oil'], NULL, 8),
('750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Akara & Bread', 'Bean fritters with fresh bread', 1200, NULL, 10, true, false, ARRAY['Black-eyed beans', 'Onions', 'Bread'], ARRAY['Gluten'], 9),
('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Plantain & Beans', 'Fried plantain with beans porridge', 1800, NULL, 25, true, false, ARRAY['Plantain', 'Beans', 'Palm oil'], NULL, 10);

-- Insert drinks for Mama Ngozi Kitchen
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, prep_time, is_available, is_featured, ingredients, allergens, sort_order) VALUES
('750e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Zobo Drink', 'Refreshing hibiscus drink with ginger', 800, NULL, 5, true, true, ARRAY['Hibiscus', 'Ginger', 'Cucumber'], NULL, 1),
('750e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Chapman', 'Nigerian fruit cocktail', 1200, NULL, 5, true, false, ARRAY['Fanta', 'Sprite', 'Grenadine', 'Fruits'], NULL, 2),
('750e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Palm Wine', 'Fresh palm wine', 1000, NULL, 0, true, false, ARRAY['Palm wine'], NULL, 3),
('750e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Kunu Drink', 'Millet-based traditional drink', 600, NULL, 5, true, false, ARRAY['Millet', 'Ginger', 'Dates'], NULL, 4),
('750e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Tiger Nut Drink', 'Creamy tiger nut milk', 700, NULL, 5, true, false, ARRAY['Tiger nuts', 'Dates', 'Coconut'], NULL, 5),
('750e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Fresh Orange Juice', 'Freshly squeezed orange juice', 900, NULL, 3, true, true, ARRAY['Fresh oranges'], NULL, 6),
('750e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Pineapple Juice', 'Fresh pineapple juice', 1000, NULL, 3, true, false, ARRAY['Fresh pineapple'], NULL, 7),
('750e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Coca Cola', 'Classic Coca Cola', 400, NULL, 0, true, false, ARRAY['Coca Cola'], NULL, 8),
('750e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Fanta Orange', 'Orange flavored soda', 400, NULL, 0, true, false, ARRAY['Fanta'], NULL, 9),
('750e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'Bottled Water', 'Pure drinking water', 300, NULL, 0, true, false, ARRAY['Water'], NULL, 10);

-- Insert Nigerian main dishes for Abuja Delights
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, prep_time, is_available, is_featured, ingredients, allergens, sort_order) VALUES
('750e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'Tuwo Shinkafa', 'Northern rice meal with miyan kuka', 2800, NULL, 35, true, true, ARRAY['Rice flour', 'Baobab leaves', 'Meat'], NULL, 1),
('750e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'Masa', 'Rice cakes with pepper sauce', 1500, NULL, 20, true, false, ARRAY['Rice', 'Yeast', 'Peppers'], NULL, 2),
('750e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'Dambu Nama', 'Shredded meat delicacy', 3200, NULL, 25, true, true, ARRAY['Beef', 'Onions', 'Spices'], NULL, 3),
('750e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'Kilishi', 'Spiced dried meat', 2500, NULL, 0, true, true, ARRAY['Beef', 'Groundnuts', 'Spices'], NULL, 4),
('750e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'Fura da Nono', 'Millet balls with fresh milk', 1200, NULL, 10, true, false, ARRAY['Millet', 'Fresh milk', 'Ginger'], ARRAY['Dairy'], 5),
('750e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'Miyan Kubewa', 'Okra soup with meat', 2600, NULL, 30, true, false, ARRAY['Okra', 'Meat', 'Onions'], NULL, 6),
('750e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'Kosai', 'Bean cakes', 1000, NULL, 15, true, false, ARRAY['Black-eyed beans', 'Onions'], NULL, 7),
('750e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'Gwate', 'Bean and corn cake', 1300, NULL, 20, true, false, ARRAY['Beans', 'Corn', 'Palm oil'], NULL, 8),
('750e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'Dan Wake', 'Steamed bean dumpling', 1800, NULL, 25, true, false, ARRAY['Beans', 'Spices'], NULL, 9),
('750e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440003', 'Tsire', 'Grilled meat on sticks', 2200, NULL, 15, true, true, ARRAY['Beef', 'Suya spice'], NULL, 10);

-- Insert drinks for Abuja Delights
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, prep_time, is_available, is_featured, ingredients, allergens, sort_order) VALUES
('750e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'Fura Drink', 'Millet-based energy drink', 700, NULL, 5, true, true, ARRAY['Millet', 'Milk', 'Sugar'], ARRAY['Dairy'], 1),
('750e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'Kunun Aya', 'Tiger nut milk drink', 800, NULL, 5, true, false, ARRAY['Tiger nuts', 'Coconut'], NULL, 2),
('750e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'Tamarind Drink', 'Sweet and sour tamarind juice', 600, NULL, 5, true, false, ARRAY['Tamarind', 'Ginger', 'Sugar'], NULL, 3),
('750e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'Baobab Juice', 'Refreshing baobab fruit drink', 900, NULL, 5, true, false, ARRAY['Baobab fruit', 'Water', 'Sugar'], NULL, 4),
('750e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'Ginger Drink', 'Spicy ginger beverage', 500, NULL, 5, true, true, ARRAY['Ginger', 'Lemon', 'Honey'], NULL, 5),
('750e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'Watermelon Juice', 'Fresh watermelon juice', 800, NULL, 3, true, false, ARRAY['Watermelon'], NULL, 6),
('750e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'Sprite', 'Lemon-lime soda', 400, NULL, 0, true, false, ARRAY['Sprite'], NULL, 7),
('750e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', '7UP', 'Crisp lemon-lime drink', 400, NULL, 0, true, false, ARRAY['7UP'], NULL, 8),
('750e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'Malt Drink', 'Non-alcoholic malt beverage', 600, NULL, 0, true, false, ARRAY['Malt'], NULL, 9),
('750e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004', 'Energy Drink', 'High energy drink', 800, NULL, 0, true, false, ARRAY['Energy drink'], NULL, 10);

-- Insert Nigerian main dishes for Calabar Kitchen
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, prep_time, is_available, is_featured, ingredients, allergens, sort_order) VALUES
('750e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'Afang Soup', 'Traditional Cross River soup with vegetables', 3500, NULL, 45, true, true, ARRAY['Afang leaves', 'Water leaves', 'Meat', 'Fish'], ARRAY['Fish'], 1),
('750e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'Edikang Ikong', 'Nutritious vegetable soup', 3200, NULL, 40, true, true, ARRAY['Ugu leaves', 'Water leaves', 'Beef', 'Dried fish'], ARRAY['Fish'], 2),
('750e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'Fisherman Soup', 'Fresh fish pepper soup', 4000, NULL, 35, true, true, ARRAY['Fresh fish', 'Pepper soup spice', 'Scent leaves'], ARRAY['Fish'], 3),
('750e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'Coconut Rice', 'Rice cooked in coconut milk', 2800, NULL, 25, true, false, ARRAY['Rice', 'Coconut milk', 'Vegetables'], NULL, 4),
('750e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'Ekpang Nkukwo', 'Cocoyam and plantain porridge', 3000, NULL, 50, true, false, ARRAY['Cocoyam', 'Plantain', 'Palm oil'], NULL, 5),
('750e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'Abacha', 'African salad with palm oil dressing', 2500, NULL, 20, true, false, ARRAY['Cassava', 'Palm oil', 'Fish', 'Ugba'], ARRAY['Fish'], 6),
('750e8400-e29b-41d4-a716-446655440047', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'Nkwobi', 'Spiced cow foot delicacy', 3800, NULL, 60, true, true, ARRAY['Cow foot', 'Palm oil', 'Utazi'], NULL, 7),
('750e8400-e29b-41d4-a716-446655440048', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'Ukwa', 'Breadfruit porridge', 2200, NULL, 45, true, false, ARRAY['Breadfruit', 'Palm oil', 'Fish'], ARRAY['Fish'], 8),
('750e8400-e29b-41d4-a716-446655440049', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'Pepper Soup (Fish)', 'Spicy catfish pepper soup', 3500, NULL, 30, true, true, ARRAY['Catfish', 'Pepper soup spice'], ARRAY['Fish'], 9),
('750e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005', 'Oha Soup', 'Traditional soup with oha leaves', 3300, NULL, 40, true, false, ARRAY['Oha leaves', 'Cocoyam', 'Meat'], NULL, 10);

-- Insert drinks for Calabar Kitchen
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, prep_time, is_available, is_featured, ingredients, allergens, sort_order) VALUES
('750e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', 'Coconut Water', 'Fresh coconut water', 800, NULL, 0, true, true, ARRAY['Fresh coconut'], NULL, 1),
('750e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', 'Soursop Juice', 'Creamy soursop fruit juice', 1200, NULL, 5, true, true, ARRAY['Soursop', 'Milk', 'Sugar'], ARRAY['Dairy'], 2),
('750e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', 'Cashew Juice', 'Fresh cashew fruit juice', 1000, NULL, 5, true, false, ARRAY['Cashew fruit'], NULL, 3),
('750e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', 'Ugba Drink', 'Fermented locust bean drink', 600, NULL, 5, true, false, ARRAY['Locust beans', 'Ginger'], NULL, 4),
('750e8400-e29b-41d4-a716-446655440055', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', 'Pawpaw Juice', 'Fresh papaya juice', 900, NULL, 3, true, false, ARRAY['Papaya'], NULL, 5),
('750e8400-e29b-41d4-a716-446655440056', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', 'Guava Juice', 'Sweet guava fruit juice', 1100, NULL, 5, true, false, ARRAY['Guava'], NULL, 6),
('750e8400-e29b-41d4-a716-446655440057', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', 'Lime Juice', 'Fresh lime juice', 700, NULL, 3, true, true, ARRAY['Lime', 'Water', 'Sugar'], NULL, 7),
('750e8400-e29b-41d4-a716-446655440058', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', 'Milo Drink', 'Chocolate malt drink', 600, NULL, 2, true, false, ARRAY['Milo', 'Milk'], ARRAY['Dairy'], 8),
('750e8400-e29b-41d4-a716-446655440059', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', 'Bournvita', 'Malted chocolate drink', 600, NULL, 2, true, false, ARRAY['Bournvita', 'Milk'], ARRAY['Dairy'], 9),
('750e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440006', 'Ice Tea', 'Chilled tea with lemon', 500, NULL, 0, true, false, ARRAY['Tea', 'Lemon', 'Sugar'], NULL, 10);