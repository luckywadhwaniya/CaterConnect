from django.db import models


class GroceryCategory(models.Model):
    name = models.CharField(max_length=200)  # Gujarati
    name_en = models.CharField(max_length=200)  # English
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'name_en']
        verbose_name_plural = 'Grocery Categories'

    def __str__(self):
        return f"{self.name_en} ({self.name})"


class GroceryItem(models.Model):
    UNIT_CHOICES = [
        ('kg', 'Kilogram (kg)'),
        ('gram', 'Gram'),
        ('litre', 'Litre'),
        ('ml', 'Millilitre (ml)'),
        ('piece', 'Piece'),
        ('packet', 'Packet'),
        ('dozen', 'Dozen'),
    ]

    category = models.ForeignKey(
        GroceryCategory,
        on_delete=models.CASCADE,
        related_name='items'
    )
    name = models.CharField(max_length=200)  # Gujarati
    name_en = models.CharField(max_length=200, blank=True)  # English
    default_unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default='kg')
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.name} ({self.category.name_en})"
