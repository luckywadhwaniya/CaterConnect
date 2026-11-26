from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='groceryorder',
            name='subtotal_amount',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=12),
        ),
        migrations.AddField(
            model_name='groceryorder',
            name='tax_amount',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
        ),
        migrations.AddField(
            model_name='groceryorder',
            name='delivery_charge',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
        ),
        migrations.AddField(
            model_name='groceryorder',
            name='discount_amount',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
        ),
        migrations.AddField(
            model_name='groceryorder',
            name='total_amount',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=12),
        ),
        migrations.AddField(
            model_name='groceryorder',
            name='is_billed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='groceryorder',
            name='billed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='groceryorderitem',
            name='unit_price',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
        ),
        migrations.AddField(
            model_name='groceryorderitem',
            name='total_price',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=12),
        ),
    ]
