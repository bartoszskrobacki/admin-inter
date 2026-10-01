import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { menuAPI, type MenuCategory } from '@/lib/api';
import { PROMOTION_TAGS } from '@/lib/tags';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MenuCategoryEditor } from '@/components/MenuCategoryEditor';
import { MenuItemEditor, MenuItemRow } from '@/components/MenuItemRow';

export function MenuPage() {
  const [tag, setTag] = useState<string>(PROMOTION_TAGS[0]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);
  // null = new category form, number = id of category being edited
  const [editingId, setEditingId] = useState<number | null | undefined>(undefined);
  // itemId null = new dish form in the given category
  const [editingItem, setEditingItem] = useState<{ categoryId: number; itemId: number | null } | undefined>(undefined);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const loadMenu = useCallback(async () => {
    setLoading(true);
    try {
      const menu = await menuAPI.getOne(tag);
      setCategories(menu.categories);
    } catch (error) {
      // No menu for this tag yet - it is created with the first category
      if (isAxiosError(error) && error.response?.status === 404) {
        setCategories([]);
      } else {
        console.error('Failed to load menu:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [tag]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const handleDelete = async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć tę kategorię razem ze wszystkimi daniami?')) return;

    try {
      await menuAPI.deleteCategory(id);
      await loadMenu();
    } catch (error) {
      console.error('Failed to delete menu category:', error);
      alert('Nie udało się usunąć kategorii');
    }
  };

  const handleRebuild = async () => {
    setRebuilding(true);
    try {
      await menuAPI.rebuild();
      alert('Uruchomiono przebudowę strony');
    } catch (error) {
      console.error('Failed to trigger rebuild:', error);
      alert('Nie udało się uruchomić przebudowy strony');
    } finally {
      setRebuilding(false);
    }
  };

  const handleSaved = () => {
    setEditingId(undefined);
    loadMenu();
  };

  const handleItemSaved = () => {
    setEditingItem(undefined);
    loadMenu();
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć to danie?')) return;

    try {
      await menuAPI.deleteItem(id);
      await loadMenu();
    } catch (error) {
      console.error('Failed to delete dish:', error);
      alert('Nie udało się usunąć dania');
    }
  };

  const handleMoveCategory = async (index: number, direction: -1 | 1) => {
    const current = categories[index];
    const target = categories[index + direction];
    if (!target) return;

    // Swap positions; fall back to list indexes when positions are equal
    const currentPosition = current.position === target.position ? index : current.position;
    const targetPosition = current.position === target.position ? index + direction : target.position;

    try {
      await Promise.all([
        menuAPI.updateCategory(current.id, { position: targetPosition }),
        menuAPI.updateCategory(target.id, { position: currentPosition }),
      ]);
      await loadMenu();
    } catch (error) {
      console.error('Failed to reorder categories:', error);
      alert('Nie udało się zmienić kolejności kategorii');
    }
  };

  const handleMoveItem = async (category: MenuCategory, index: number, direction: -1 | 1) => {
    const current = category.items[index];
    const target = category.items[index + direction];
    if (!target) return;

    // Swap positions; fall back to list indexes when positions are equal
    const currentPosition = current.position === target.position ? index : current.position;
    const targetPosition = current.position === target.position ? index + direction : target.position;

    try {
      await Promise.all([
        menuAPI.updateItem(current.id, { position: targetPosition }),
        menuAPI.updateItem(target.id, { position: currentPosition }),
      ]);
      await loadMenu();
    } catch (error) {
      console.error('Failed to reorder dishes:', error);
      alert('Nie udało się zmienić kolejności dań');
    }
  };

  const handleTagChange = (value: string) => {
    setEditingId(undefined);
    setEditingItem(undefined);
    setTag(value);
  };

  const nextPosition = categories.length
    ? Math.max(...categories.map((c) => c.position)) + 1
    : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menu</h1>
        <div className="flex gap-2">
          <Button onClick={() => setEditingId(null)} disabled={editingId === null}>
            Dodaj kategorię
          </Button>
          <Button variant="outline" onClick={handleRebuild} disabled={rebuilding}>
            {rebuilding ? 'Przebudowywanie...' : 'Przebuduj stronę'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/promotions')}>
            Promocje
          </Button>
          <Button variant="outline" onClick={logout}>
            Wyloguj
          </Button>
        </div>
      </div>

      <div className="mb-6 max-w-xs">
        <Label htmlFor="menu-tag">Lokal</Label>
        <Select value={tag} onValueChange={handleTagChange}>
          <SelectTrigger id="menu-tag">
            <SelectValue placeholder="Wybierz lokal" />
          </SelectTrigger>
          <SelectContent>
            {PROMOTION_TAGS.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {editingId === null && (
        <div className="mb-4">
          <MenuCategoryEditor
            menuTag={tag}
            category={null}
            nextPosition={nextPosition}
            onSaved={handleSaved}
            onCancel={() => setEditingId(undefined)}
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">Ładowanie...</div>
      ) : categories.length === 0 ? (
        editingId !== null && (
          <p className="text-muted-foreground">To menu nie ma jeszcze kategorii.</p>
        )
      ) : (
        <div className="space-y-4">
          {categories.map((category, categoryIdx) =>
            editingId === category.id ? (
              <MenuCategoryEditor
                key={category.id}
                menuTag={tag}
                category={category}
                nextPosition={nextPosition}
                onSaved={handleSaved}
                onCancel={() => setEditingId(undefined)}
              />
            ) : (
              <Card key={category.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>
                      {category.position}. {category.name}
                    </CardTitle>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={categoryIdx === 0}
                      onClick={() => handleMoveCategory(categoryIdx, -1)}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={categoryIdx === categories.length - 1}
                      onClick={() => handleMoveCategory(categoryIdx, 1)}
                    >
                      ↓
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(category.id)}>
                      Edytuj
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(category.id)}
                    >
                      Usuń
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {category.items.length === 0 && editingItem?.categoryId !== category.id && (
                    <p className="text-sm text-muted-foreground">Brak dań.</p>
                  )}
                  <div className="divide-y">
                    {category.items.map((item, idx) =>
                      editingItem?.itemId === item.id ? (
                        <MenuItemEditor
                          key={item.id}
                          categoryId={category.id}
                          item={item}
                          onSaved={handleItemSaved}
                          onCancel={() => setEditingItem(undefined)}
                        />
                      ) : (
                        <MenuItemRow
                          key={item.id}
                          item={item}
                          isFirst={idx === 0}
                          isLast={idx === category.items.length - 1}
                          onEdit={() => setEditingItem({ categoryId: category.id, itemId: item.id })}
                          onMove={(direction) => handleMoveItem(category, idx, direction)}
                          onDelete={() => handleDeleteItem(item.id)}
                        />
                      )
                    )}
                    {editingItem?.categoryId === category.id && editingItem.itemId === null && (
                      <MenuItemEditor
                        categoryId={category.id}
                        item={null}
                        onSaved={handleItemSaved}
                        onCancel={() => setEditingItem(undefined)}
                      />
                    )}
                  </div>
                  {!(editingItem?.categoryId === category.id && editingItem.itemId === null) && (
                    <Button
                      className="mt-2"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingItem({ categoryId: category.id, itemId: null })}
                    >
                      Dodaj danie
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
