from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GroceryCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('name_en', models.CharField(max_length=200)),
                ('order', models.IntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name_plural': 'Grocery Categories',
                'ordering': ['order', 'name_en'],
            },
        ),
        migrations.CreateModel(
            name='GroceryItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('name_en', models.CharField(blank=True, max_length=200)),
                ('default_unit', models.CharField(choices=[('kg', 'Kilogram (kg)'), ('gram', 'Gram'), ('litre', 'Litre'), ('ml', 'Millilitre (ml)'), ('piece', 'Piece'), ('packet', 'Packet'), ('dozen', 'Dozen')], default='kg', max_length=10)),
                ('is_active', models.BooleanField(default=True)),
                ('order', models.IntegerField(default=0)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='grocery.grocerycategory')),
            ],
            options={
                'ordering': ['order', 'name'],
            },
        ),
    ]
