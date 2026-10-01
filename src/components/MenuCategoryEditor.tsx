import { useState } from 'react';
import { menuAPI, type MenuCategory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface MenuCategoryEditorProps {
  menuTag: string;
  category: MenuCategory | null;
  nextPosition: number;
  onSaved: () => void;
  onCancel: () => void;
}

export function MenuCategoryEditor({ menuTag, category, nextPosition, onSaved, onCancel }: MenuCategoryEditorProps) {
  const isEdit = !!category;
  const idSuffix = category?.id ?? 'new';
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [position, setPosition] = useState(String(category?.position ?? nextPosition));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Dishes are managed one by one, so only category fields are sent
      const payload = {
        name,
        description: description || undefined,
        position: parseInt(position, 10) || 0,
      };

      if (isEdit) {
        await menuAPI.updateCategory(category.id, payload);
      } else {
        await menuAPI.createCategory(menuTag, { ...payload, items: [] });
      }

      onSaved();
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} menu category:`, error);
      alert(`Nie udało się ${isEdit ? 'zapisać' : 'utworzyć'} kategorii`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle>{isEdit ? `Edycja: ${category.name}` : 'Nowa kategoria'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr_100px] gap-3">
          <div>
            <Label htmlFor={`name-${idSuffix}`}>Nazwa kategorii</Label>
            <Input id={`name-${idSuffix}`} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={`description-${idSuffix}`}>Opis</Label>
            <Input
              id={`description-${idSuffix}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`position-${idSuffix}`}>Pozycja</Label>
            <Input
              id={`position-${idSuffix}`}
              type="number"
              step="1"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (isEdit ? 'Zapisywanie...' : 'Tworzenie...') : (isEdit ? 'Zapisz zmiany' : 'Utwórz kategorię')}
        </Button>
      </CardFooter>
    </Card>
  );
}
