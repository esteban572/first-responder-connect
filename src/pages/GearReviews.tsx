import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Plus, Package, Filter } from "lucide-react";
import { GearItem, GEAR_CATEGORIES } from "@/types/gear";
import { getGearItems, getGearBrands } from "@/lib/gearService";
import { GearItemCard } from "@/components/gear/GearItemCard";
import { GearItemForm } from "@/components/gear/GearItemForm";
import { cn } from "@/lib/utils";

const GearReviews = () => {
  const [items, setItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [brands, setBrands] = useState<string[]>([]);
  const [addItemOpen, setAddItemOpen] = useState(false);

  useEffect(() => {
    loadItems();
  }, [categoryFilter, brandFilter]);

  useEffect(() => {
    loadBrands();
  }, [categoryFilter]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getGearItems({
        category_id: categoryFilter !== "all" ? categoryFilter : undefined,
        brand: brandFilter !== "all" ? brandFilter : undefined,
        search: search || undefined,
      });
      setItems(data);
    } catch (error) {
      console.error("Error loading gear items:", error);
      toast.error("Failed to load gear items");
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    const brandsList = await getGearBrands(
      categoryFilter !== "all" ? categoryFilter : undefined
    );
    setBrands(brandsList);
    // Reset brand filter if selected brand is not in new list
    if (brandFilter !== "all" && !brandsList.includes(brandFilter)) {
      setBrandFilter("all");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadItems();
  };

  const handleItemSaved = () => {
    loadItems();
    loadBrands();
  };

  // Group items by category for display
  const groupedItems = GEAR_CATEGORIES.reduce(
    (acc, cat) => {
      const categoryItems = items.filter((item) => item.category_id === cat.id);
      if (categoryItems.length > 0) {
        acc[cat.id] = {
          name: cat.name,
          items: categoryItems,
        };
      }
      return acc;
    },
    {} as Record<string, { name: string; items: GearItem[] }>
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-4 md:py-6">
        {/* Header */}
        <div className="px-4 md:px-0 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold font-display mb-1">Gear Reviews</h1>
              <p className="text-muted-foreground">
                Community reviews for medical gear and equipment
              </p>
            </div>
            <Button onClick={() => setAddItemOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Gear</span>
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search gear..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {GEAR_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Category Tabs (if no filter applied) */}
        {categoryFilter === "all" && (
          <div className="px-4 md:px-0 mb-6 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {GEAR_CATEGORIES.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-muted hover:bg-muted/80 transition-colors"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-4 md:px-0">
          {loading ? (
            <div className="feed-card p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading gear...</p>
            </div>
          ) : items.length > 0 ? (
            categoryFilter !== "all" ? (
              // Grid view for filtered category
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                  <GearItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              // Grouped view for all categories
              <div className="space-y-8">
                {Object.entries(groupedItems).map(([catId, { name, items: catItems }]) => (
                  <div key={catId}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">{name}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCategoryFilter(catId)}
                      >
                        View all
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {catItems.slice(0, 4).map((item) => (
                        <GearItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="feed-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No gear found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search || categoryFilter !== "all" || brandFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Be the first to add gear to review"}
              </p>
              <Button onClick={() => setAddItemOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Gear
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Dialog */}
      <GearItemForm
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        onSaved={handleItemSaved}
        defaultCategory={categoryFilter !== "all" ? categoryFilter : undefined}
      />
    </AppLayout>
  );
};

export default GearReviews;
