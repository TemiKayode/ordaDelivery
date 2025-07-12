import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Category {
  name: string;
  icon: string;
  count: number;
}

interface CategorySectionProps {
  categories: Category[];
  onCategoryClick: (category: string | null) => void;
  selectedCategory: string | null;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  onCategoryClick,
  selectedCategory
}) => {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Browse Categories</h2>
        {selectedCategory && (
          <button
            onClick={() => onCategoryClick(null)}
            className="text-accent hover:text-accent/80 text-sm font-medium"
          >
            Clear Filter
          </button>
        )}
      </div>
      
      {/* Horizontal Scrollable Categories */}
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-3 min-w-max">
          {categories.map((category) => (
            <Card
              key={category.name}
              className={`flex-shrink-0 w-28 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border rounded-xl ${
                selectedCategory === category.name
                  ? 'border-accent bg-accent/5 shadow-md'
                  : 'border-muted hover:border-accent/30 bg-card'
              }`}
              onClick={() => onCategoryClick(
                selectedCategory === category.name ? null : category.name
              )}
            >
              <CardContent className="p-3 text-center">
                <div className="space-y-2">
                  {/* Icon */}
                  <div className="text-3xl mx-auto w-fit">
                    {category.icon}
                  </div>
                  
                  {/* Category Name */}
                  <div>
                    <h3 className="font-medium text-foreground text-xs leading-tight">
                      {category.name}
                    </h3>
                    <div className="mt-1.5">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-1.5 py-0.5 rounded-md ${
                          selectedCategory === category.name
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {category.count}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;