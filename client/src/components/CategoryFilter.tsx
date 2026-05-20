import { Button } from '@/components/ui/button';
import type { Category } from '../../../drizzle/schema';

interface CategoryFilterProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function CategoryFilter({
  categories,
  selectedId,
  onSelect
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Button
        variant={selectedId === null ? 'default' : 'outline'}
        onClick={() => onSelect(null)}
        className="rounded-sm"
      >
        All Posts
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedId === category.id ? 'default' : 'outline'}
          onClick={() => onSelect(category.id)}
          className="rounded-sm"
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
