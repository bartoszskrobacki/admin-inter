import { useState } from 'react';
import { promotionAPI, type Promotion, type Meal } from '@/lib/api';

type MealForm = Omit<Meal, 'price'> & { price: string };
import { PROMOTION_TAGS } from '@/lib/tags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PromotionDialogProps {
  promotion: Promotion | null;
  onClose: () => void;
}

export function PromotionDialog({ promotion, onClose }: PromotionDialogProps) {
  const isEdit = !!promotion;
  const [name, setName] = useState(promotion?.name || '');
  const [tag, setTag] = useState(promotion?.tag || '');
  const [meals, setMeals] = useState<MealForm[]>(
    promotion?.meals.map((m) => ({ ...m, price: String(m.price) })) || [{ name: '', description: '', price: '' }]
  );
  const [publishToFacebook, setPublishToFacebook] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMealChange = (index: number, field: keyof MealForm, value: string) => {
    const newMeals = [...meals];
    newMeals[index] = { ...newMeals[index], [field]: value };
    setMeals(newMeals);
  };

  const handleAddMeal = () => {
    setMeals([...meals, { name: '', description: '', price: '' }]);
  };

  const handleRemoveMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Clean meals data - send only allowed fields
      const cleanMeals = meals.map((meal) => ({
        name: meal.name,
        description: meal.description,
        additionals: meal.additionals,
        price: parseFloat(meal.price),
      }));

      if (isEdit) {
        await promotionAPI.update(promotion.id, {
          name,
          tag,
          meals: cleanMeals,
          publishToFacebook
        });
      } else {
        await promotionAPI.create({ name, tag, meals: cleanMeals });
      }

      onClose();
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} promotion:`, error);
      alert(`Nie udało się ${isEdit ? 'zapisać' : 'utworzyć'} promocji`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edytuj promocję' : 'Nowa promocja'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Zmień dane promocji i dania' : 'Dodaj nową promocję z daniami'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nazwa promocji</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="tag">Lokal</Label>
            <Select value={tag} onValueChange={setTag} disabled={isEdit}>
              <SelectTrigger id="tag">
                <SelectValue placeholder="Wybierz lokal" />
              </SelectTrigger>
              <SelectContent>
                {PROMOTION_TAGS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEdit && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="publish-facebook"
                checked={publishToFacebook}
                onCheckedChange={(checked) => setPublishToFacebook(!!checked)}
              />
              <Label
                htmlFor="publish-facebook"
                className="text-sm font-normal cursor-pointer"
              >
                Opublikuj na Facebooku
              </Label>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Dania</Label>
              <Button type="button" size="sm" variant="outline" onClick={handleAddMeal}>
                Dodaj danie
              </Button>
            </div>

            {meals.map((meal, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Danie {index + 1}</h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveMeal(index)}
                  >
                    Usuń
                  </Button>
                </div>

                <div>
                  <Label>Nazwa</Label>
                  <Input
                    value={meal.name}
                    onChange={(e) => handleMealChange(index, 'name', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Opis</Label>
                  <Input
                    value={meal.description || ''}
                    onChange={(e) => handleMealChange(index, 'description', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Cena (zł)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={meal.price}
                    onChange={(e) => handleMealChange(index, 'price', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (isEdit ? 'Zapisywanie...' : 'Tworzenie...') : (isEdit ? 'Zapisz zmiany' : 'Utwórz promocję')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
