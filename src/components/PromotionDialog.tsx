import { useState } from 'react';
import { promotionAPI, type Promotion, type Meal } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [meals, setMeals] = useState<Meal[]>(promotion?.meals || [{ name: '', description: '', price: 0 }]);
  const [publishToFacebook, setPublishToFacebook] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMealChange = (index: number, field: keyof Meal, value: string | number) => {
    const newMeals = [...meals];
    newMeals[index] = { ...newMeals[index], [field]: value };
    setMeals(newMeals);
  };

  const handleAddMeal = () => {
    setMeals([...meals, { name: '', description: '', price: 0 }]);
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
        price: Number(meal.price), // Ensure it's a number
      }));

      if (isEdit) {
        await promotionAPI.update(promotion.id, {
          name,
          meals: cleanMeals,
          publishToFacebook
        });
      } else {
        await promotionAPI.create({ name, meals: cleanMeals });
      }

      onClose();
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} promotion:`, error);
      alert(`Failed to ${isEdit ? 'update' : 'create'} promotion`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update promotion details and meals' : 'Add a new promotion with meals'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Promotion Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
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
                Publish to Facebook
              </Label>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Meals</Label>
              <Button type="button" size="sm" variant="outline" onClick={handleAddMeal}>
                Add Meal
              </Button>
            </div>

            {meals.map((meal, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Meal {index + 1}</h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveMeal(index)}
                  >
                    Remove
                  </Button>
                </div>

                <div>
                  <Label>Name</Label>
                  <Input
                    value={meal.name}
                    onChange={(e) => handleMealChange(index, 'name', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={meal.description || ''}
                    onChange={(e) => handleMealChange(index, 'description', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Price (zł)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={meal.price}
                    onChange={(e) => handleMealChange(index, 'price', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Promotion')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
