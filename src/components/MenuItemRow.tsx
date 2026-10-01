import { useState } from 'react';
import { menuAPI, type MenuItem } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MenuItemEditorProps {
  categoryId: number;
  item: MenuItem | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function MenuItemEditor({ categoryId, item, onSaved, onCancel }: MenuItemEditorProps) {
  const isEdit = !!item;
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [price, setPrice] = useState(item ? String(item.price) : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name,
        description: description || undefined,
        price: parseFloat(price),
      };

      if (isEdit) {
        await menuAPI.updateItem(item.id, payload);
      } else {
        await menuAPI.createItem(categoryId, payload);
      }

      onSaved();
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} dish:`, error);
      alert(`Nie udało się ${isEdit ? 'zapisać' : 'dodać'} dania`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr_100px_auto] gap-2 items-center py-2">
      <Input placeholder="Nazwa" value={name} onChange={(e) => setName(e.target.value)} />
      <Input
        placeholder="Opis"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        placeholder="Cena (zł)"
        type="number"
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <div className="flex gap-1">
        <Button size="sm" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Zapisywanie...' : isEdit ? 'Zapisz' : 'Dodaj'}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </div>
  );
}

interface MenuItemRowProps {
  item: MenuItem;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
}

export function MenuItemRow({ item, isFirst, isLast, onEdit, onMove, onDelete }: MenuItemRowProps) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 text-sm">
      <div>
        <p className="font-medium">{item.name}</p>
        {item.description && <p className="text-muted-foreground">{item.description}</p>}
      </div>
      <div className="flex items-center gap-1">
        <span className="font-medium whitespace-nowrap mr-2">{item.price} zł</span>
        <Button size="sm" variant="outline" disabled={isFirst} onClick={() => onMove(-1)}>
          ↑
        </Button>
        <Button size="sm" variant="outline" disabled={isLast} onClick={() => onMove(1)}>
          ↓
        </Button>
        <Button size="sm" variant="outline" onClick={onEdit}>
          Edytuj
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          ✕
        </Button>
      </div>
    </div>
  );
}
