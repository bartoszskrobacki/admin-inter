import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { promotionAPI, type Promotion } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PromotionDialog } from '@/components/PromotionDialog';
import { ImagePreviewDialog } from '@/components/ImagePreviewDialog';

export function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null | undefined>(undefined);
  const [previewTag, setPreviewTag] = useState<string | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const loadPromotions = async () => {
    try {
      const data = await promotionAPI.getAll();
      setPromotions(data);
    } catch (error) {
      console.error('Failed to load promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę promocję?')) return;

    try {
      await promotionAPI.delete(id);
      await loadPromotions();
    } catch (error) {
      console.error('Failed to delete promotion:', error);
      alert('Nie udało się usunąć promocji');
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
  };

  const handleDialogClose = () => {
    setSelectedPromotion(undefined);
    loadPromotions();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Ładowanie...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Promocje</h1>
        <div className="flex gap-2">
          <Button onClick={() => setSelectedPromotion(null)}>
            Dodaj promocję
          </Button>
          <Button variant="outline" onClick={() => navigate('/menu')}>
            Menu
          </Button>
          <Button variant="outline" onClick={logout}>
            Wyloguj
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((promotion) => (
          <Card key={promotion.id}>
            <CardHeader>
              <CardTitle>{promotion.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {promotion.meals.map((meal, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium">
                      {meal.name} - {meal.price} zł
                    </p>
                    {meal.description && (
                      <p className="text-muted-foreground">{meal.description}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPreviewTag(promotion.tag)}>
                  Podgląd
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(promotion)}>
                  Edytuj
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(promotion.id)}
                >
                  Usuń
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPromotion !== undefined && (
        <PromotionDialog
          promotion={selectedPromotion}
          onClose={handleDialogClose}
        />
      )}

      {previewTag && (
        <ImagePreviewDialog
          promotionTag={previewTag}
          onClose={() => setPreviewTag(null)}
        />
      )}
    </div>
  );
}
