/*
# Update Menu Categories for Nigerian Food Delivery

1. New Categories Structure
   - Traditional Yoruba Delicacies
   - Grilled & Pepper Soup Corner
   - Rice Specials
   - Street Food & Quick Bites
   - Soups & Stews (à la carte)
   - Bakery & Pastry
   - Continental & Fast Food
   - Drinks & Smoothies
   - Healthy & Fit Meals
   - Vegan & Vegetarian Options

2. Updates
   - Clear existing categories and menu items
   - Insert new categories with proper structure
   - Add comprehensive menu items for each category
   - Ensure proper restaurant associations
*/

-- Clear existing categories and menu items to start fresh
DELETE FROM public.order_items;
DELETE FROM public.menu_items;
DELETE FROM public.categories;

-- Insert new categories for all restaurants
INSERT INTO public.categories (id, restaurant_id, name, description, sort_order, is_active) VALUES
-- Mama Ngozi Kitchen categories
('cat-001', '550e8400-e29b-41d4-a716-446655440001', 'Traditional Yoruba Delicacies', 'Authentic Yoruba traditional meals', 1, true),
('cat-002', '550e8400-e29b-41d4-a716-446655440001', 'Grilled & Pepper Soup Corner', 'Grilled meats and spicy pepper soups', 2, true),
('cat-003', '550e8400-e29b-41d4-a716-446655440001', 'Rice Specials', 'Various rice preparations', 3, true),
('cat-004', '550e8400-e29b-41d4-a716-446655440001', 'Street Food & Quick Bites', 'Popular Nigerian street foods', 4, true),
('cat-005', '550e8400-e29b-41d4-a716-446655440001', 'Soups & Stews (à la carte)', 'Traditional soups and stews', 5, true),
('cat-006', '550e8400-e29b-41d4-a716-446655440001', 'Drinks & Smoothies', 'Refreshing beverages', 6, true),

-- Abuja Delights categories
('cat-007', '550e8400-e29b-41d4-a716-446655440002', 'Traditional Yoruba Delicacies', 'Authentic Yoruba traditional meals', 1, true),
('cat-008', '550e8400-e29b-41d4-a716-446655440002', 'Rice Specials', 'Various rice preparations', 2, true),
('cat-009', '550e8400-e29b-41d4-a716-446655440002', 'Continental & Fast Food', 'Western and fast food options', 3, true),
('cat-010', '550e8400-e29b-41d4-a716-446655440002', 'Bakery & Pastry', 'Fresh baked goods', 4, true),
('cat-011', '550e8400-e29b-41d4-a716-446655440002', 'Drinks & Smoothies', 'Refreshing beverages', 5, true),

-- Calabar Kitchen categories
('cat-012', '550e8400-e29b-41d4-a716-446655440003', 'Traditional Yoruba Delicacies', 'Authentic Yoruba traditional meals', 1, true),
('cat-013', '550e8400-e29b-41d4-a716-446655440003', 'Grilled & Pepper Soup Corner', 'Grilled meats and spicy pepper soups', 2, true),
('cat-014', '550e8400-e29b-41d4-a716-446655440003', 'Healthy & Fit Meals', 'Nutritious and healthy options', 3, true),
('cat-015', '550e8400-e29b-41d4-a716-446655440003', 'Vegan & Vegetarian Options', 'Plant-based meals', 4, true),
('cat-016', '550e8400-e29b-41d4-a716-446655440003', 'Drinks & Smoothies', 'Refreshing beverages', 5, true);

-- Insert comprehensive menu items for Mama Ngozi Kitchen
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, prep_time, is_available, is_featured, ingredients, allergens, sort_order, discount_percentage) VALUES
-- Traditional Yoruba Delicacies
('item-001', '550e8400-e29b-41d4-a716-446655440001', 'cat-001', 'Amala & Gbegiri/Ewedu with Assorted Meats', 'Traditional yam flour with bean soup and vegetable soup, served with assorted meats', 3500, 35, true, true, ARRAY['Yam flour', 'Beans', 'Ewedu leaves', 'Assorted meats'], NULL, 1, 15),
('item-002', '550e8400-e29b-41d4-a716-446655440001', 'cat-001', 'Pounded Yam & Egusi', 'Fresh pounded yam with melon seed soup', 3200, 40, true, true, ARRAY['Yam', 'Egusi seeds', 'Palm oil', 'Meat', 'Fish'], ARRAY['Fish'], 2, 0),
('item-003', '550e8400-e29b-41d4-a716-446655440001', 'cat-001', 'Pounded Yam & Ogbono', 'Fresh pounded yam with draw soup', 3000, 35, true, false, ARRAY['Yam', 'Ogbono seeds', 'Palm oil', 'Meat'], NULL, 3, 0),
('item-004', '550e8400-e29b-41d4-a716-446655440001', 'cat-001', 'Ofada Rice & Ayamase (Designer Stew)', 'Local rice with spicy green pepper stew', 2800, 30, true, true, ARRAY['Ofada rice', 'Green peppers', 'Locust beans', 'Assorted meat'], NULL, 4, 20),
('item-005', '550e8400-e29b-41d4-a716-446655440001', 'cat-001', 'Efo Riro with Semo', 'Spinach stew with semolina', 2500, 25, true, false, ARRAY['Spinach', 'Semolina', 'Palm oil', 'Meat'], NULL, 5, 0),
('item-006', '550e8400-e29b-41d4-a716-446655440001', 'cat-001', 'Efo Riro with Iyan', 'Spinach stew with pounded yam', 2700, 30, true, false, ARRAY['Spinach', 'Yam', 'Palm oil', 'Meat'], NULL, 6, 0),
('item-007', '550e8400-e29b-41d4-a716-446655440001', 'cat-001', 'Abula (Complete Set)', 'Gbegiri + Ewedu + Stew + Amala combo', 4000, 45, true, true, ARRAY['Yam flour', 'Beans', 'Ewedu', 'Tomato stew', 'Meat'], NULL, 7, 10),

-- Grilled & Pepper Soup Corner
('item-008', '550e8400-e29b-41d4-a716-446655440001', 'cat-002', 'Suya (Beef)', 'Grilled spiced beef skewers', 2500, 20, true, true, ARRAY['Beef', 'Suya spice', 'Onions'], NULL, 1, 0),
('item-009', '550e8400-e29b-41d4-a716-446655440001', 'cat-002', 'Suya (Chicken)', 'Grilled spiced chicken skewers', 2200, 18, true, false, ARRAY['Chicken', 'Suya spice', 'Onions'], NULL, 2, 0),
('item-010', '550e8400-e29b-41d4-a716-446655440001', 'cat-002', 'Asun (Peppered Goat Meat)', 'Spicy grilled goat meat', 3500, 25, true, true, ARRAY['Goat meat', 'Peppers', 'Onions', 'Spices'], NULL, 3, 0),
('item-011', '550e8400-e29b-41d4-a716-446655440001', 'cat-002', 'Catfish Pepper Soup', 'Spicy catfish in aromatic broth', 3800, 30, true, true, ARRAY['Catfish', 'Pepper soup spice', 'Scent leaves'], ARRAY['Fish'], 4, 0),
('item-012', '550e8400-e29b-41d4-a716-446655440001', 'cat-002', 'Chicken Barbecue', 'Grilled marinated chicken', 2800, 25, true, false, ARRAY['Chicken', 'Barbecue sauce', 'Spices'], NULL, 5, 0),

-- Rice Specials
('item-013', '550e8400-e29b-41d4-a716-446655440001', 'cat-003', 'Jollof Rice', 'Spicy tomato rice with chicken', 2500, 25, true, true, ARRAY['Rice', 'Tomatoes', 'Chicken', 'Spices'], NULL, 1, 0),
('item-014', '550e8400-e29b-41d4-a716-446655440001', 'cat-003', 'Fried Rice', 'Colorful fried rice with vegetables', 2800, 20, true, false, ARRAY['Rice', 'Vegetables', 'Chicken', 'Soy sauce'], NULL, 2, 0),
('item-015', '550e8400-e29b-41d4-a716-446655440001', 'cat-003', 'Coconut Rice', 'Rice cooked in coconut milk', 2600, 25, true, false, ARRAY['Rice', 'Coconut milk', 'Vegetables'], NULL, 3, 0),
('item-016', '550e8400-e29b-41d4-a716-446655440001', 'cat-003', 'Native Jollof (Concoction Rice)', 'Traditional mixed rice with vegetables', 2400, 30, true, false, ARRAY['Rice', 'Palm oil', 'Vegetables', 'Fish'], ARRAY['Fish'], 4, 0),

-- Street Food & Quick Bites
('item-017', '550e8400-e29b-41d4-a716-446655440001', 'cat-004', 'Akara & Pap (Ogi)', 'Bean fritters with corn pudding', 1200, 15, true, true, ARRAY['Black-eyed beans', 'Corn', 'Onions'], NULL, 1, 0),
('item-018', '550e8400-e29b-41d4-a716-446655440001', 'cat-004', 'Moi Moi', 'Steamed bean pudding', 1500, 40, true, false, ARRAY['Black-eyed beans', 'Palm oil', 'Egg'], ARRAY['Eggs'], 2, 0),
('item-019', '550e8400-e29b-41d4-a716-446655440001', 'cat-004', 'Puff Puff', 'Sweet fried dough balls', 800, 10, true, false, ARRAY['Flour', 'Sugar', 'Yeast'], ARRAY['Gluten'], 3, 0),
('item-020', '550e8400-e29b-41d4-a716-446655440001', 'cat-004', 'Roasted Plantain (Boli) with Groundnut', 'Grilled plantain with roasted peanuts', 1000, 15, true, true, ARRAY['Plantain', 'Groundnuts'], ARRAY['Nuts'], 4, 0),
('item-021', '550e8400-e29b-41d4-a716-446655440001', 'cat-004', 'Yam & Egg Sauce', 'Boiled yam with scrambled eggs', 1800, 20, true, false, ARRAY['Yam', 'Eggs', 'Tomatoes', 'Onions'], ARRAY['Eggs'], 5, 0),

-- Soups & Stews
('item-022', '550e8400-e29b-41d4-a716-446655440001', 'cat-005', 'Efo Riro', 'Spinach stew with assorted meat', 2200, 25, true, false, ARRAY['Spinach', 'Palm oil', 'Meat', 'Fish'], ARRAY['Fish'], 1, 0),
('item-023', '550e8400-e29b-41d4-a716-446655440001', 'cat-005', 'Egusi Soup', 'Melon seed soup', 2500, 30, true, true, ARRAY['Egusi seeds', 'Palm oil', 'Meat'], NULL, 2, 0),
('item-024', '550e8400-e29b-41d4-a716-446655440001', 'cat-005', 'Gbegiri', 'Bean soup', 1800, 35, true, false, ARRAY['Beans', 'Palm oil', 'Locust beans'], NULL, 3, 0),
('item-025', '550e8400-e29b-41d4-a716-446655440001', 'cat-005', 'Ogbono Soup', 'Draw soup with ogbono seeds', 2300, 25, true, false, ARRAY['Ogbono seeds', 'Palm oil', 'Meat'], NULL, 4, 0),
('item-026', '550e8400-e29b-41d4-a716-446655440001', 'cat-005', 'Okro Soup', 'Okra soup with meat', 2000, 20, true, false, ARRAY['Okra', 'Palm oil', 'Meat'], NULL, 5, 0),

-- Drinks & Smoothies
('item-027', '550e8400-e29b-41d4-a716-446655440001', 'cat-006', 'Zobo Drink', 'Hibiscus drink with ginger', 800, 5, true, true, ARRAY['Hibiscus', 'Ginger', 'Cucumber'], NULL, 1, 0),
('item-028', '550e8400-e29b-41d4-a716-446655440001', 'cat-006', 'Kunu Drink', 'Millet-based drink', 600, 5, true, false, ARRAY['Millet', 'Ginger', 'Dates'], NULL, 2, 0),
('item-029', '550e8400-e29b-41d4-a716-446655440001', 'cat-006', 'Chapman', 'Nigerian fruit cocktail', 1200, 5, true, true, ARRAY['Fanta', 'Sprite', 'Grenadine', 'Fruits'], NULL, 3, 0),
('item-030', '550e8400-e29b-41d4-a716-446655440001', 'cat-006', 'Fresh Orange Juice', 'Freshly squeezed orange juice', 900, 3, true, false, ARRAY['Fresh oranges'], NULL, 4, 0);

-- Similar comprehensive items for other restaurants (abbreviated for space)
-- Abuja Delights items
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, prep_time, is_available, is_featured, ingredients, allergens, sort_order, discount_percentage) VALUES
('item-031', '550e8400-e29b-41d4-a716-446655440002', 'cat-007', 'Amala & Gbegiri/Ewedu with Assorted Meats', 'Traditional yam flour with bean and vegetable soup', 3400, 35, true, true, ARRAY['Yam flour', 'Beans', 'Ewedu leaves'], NULL, 1, 10),
('item-032', '550e8400-e29b-41d4-a716-446655440002', 'cat-008', 'Jollof Rice', 'Spicy tomato rice', 2400, 25, true, true, ARRAY['Rice', 'Tomatoes', 'Spices'], NULL, 1, 0),
('item-033', '550e8400-e29b-41d4-a716-446655440002', 'cat-009', 'Chicken Burger', 'Grilled chicken burger with fries', 3200, 15, true, false, ARRAY['Chicken', 'Bread', 'Lettuce'], ARRAY['Gluten'], 1, 0),
('item-034', '550e8400-e29b-41d4-a716-446655440002', 'cat-009', 'Beef Shawarma', 'Rolled beef with vegetables', 2800, 10, true, true, ARRAY['Beef', 'Vegetables', 'Sauce'], ARRAY['Gluten'], 2, 15),
('item-035', '550e8400-e29b-41d4-a716-446655440002', 'cat-010', 'Meat Pie', 'Pastry filled with seasoned meat', 800, 5, true, false, ARRAY['Flour', 'Meat', 'Vegetables'], ARRAY['Gluten'], 1, 0),
('item-036', '550e8400-e29b-41d4-a716-446655440002', 'cat-011', 'Zobo Drink', 'Refreshing hibiscus drink', 700, 5, true, false, ARRAY['Hibiscus', 'Ginger'], NULL, 1, 0);

-- Calabar Kitchen items
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, prep_time, is_available, is_featured, ingredients, allergens, sort_order, discount_percentage) VALUES
('item-037', '550e8400-e29b-41d4-a716-446655440003', 'cat-012', 'Pounded Yam & Egusi', 'Traditional pounded yam with egusi soup', 3300, 40, true, true, ARRAY['Yam', 'Egusi seeds', 'Palm oil'], NULL, 1, 0),
('item-038', '550e8400-e29b-41d4-a716-446655440003', 'cat-013', 'Nkwobi', 'Spiced cow foot delicacy', 3800, 60, true, true, ARRAY['Cow foot', 'Palm oil', 'Utazi'], NULL, 1, 0),
('item-039', '550e8400-e29b-41d4-a716-446655440003', 'cat-013', 'Catfish Pepper Soup', 'Fresh catfish in spicy broth', 4000, 30, true, true, ARRAY['Catfish', 'Pepper soup spice'], ARRAY['Fish'], 2, 0),
('item-040', '550e8400-e29b-41d4-a716-446655440003', 'cat-014', 'Grilled Fish with Veggies', 'Healthy grilled fish with vegetables', 3500, 25, true, false, ARRAY['Fish', 'Vegetables', 'Olive oil'], ARRAY['Fish'], 1, 0),
('item-041', '550e8400-e29b-41d4-a716-446655440003', 'cat-015', 'Beans Porridge', 'Nutritious beans cooked with vegetables', 2000, 45, true, false, ARRAY['Beans', 'Palm oil', 'Vegetables'], NULL, 1, 0),
('item-042', '550e8400-e29b-41d4-a716-446655440003', 'cat-016', 'Coconut Water', 'Fresh coconut water', 800, 0, true, true, ARRAY['Fresh coconut'], NULL, 1, 0);