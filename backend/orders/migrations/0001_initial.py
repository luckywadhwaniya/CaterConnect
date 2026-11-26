import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0001_initial'),
        ('stores', '0001_initial'),
        ('catering', '0001_initial'),
        ('grocery', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='GroceryOrder',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('order_number', models.CharField(blank=True, max_length=50, unique=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('preparing', 'Preparing'), ('ready', 'Ready'), ('completed', 'Completed'), ('rejected', 'Rejected'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                ('special_instructions', models.TextField(blank=True)),
                ('store_comment', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('catering_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='orders', to=settings.AUTH_USER_MODEL)),
                ('event', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='order', to='catering.cateringevent')),
                ('store', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='orders', to='stores.grocerystore')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='OrderStatusHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('old_status', models.CharField(max_length=20)),
                ('new_status', models.CharField(max_length=20)),
                ('comment', models.TextField(blank=True)),
                ('changed_at', models.DateTimeField(auto_now_add=True)),
                ('changed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='status_history', to='orders.groceryorder')),
            ],
            options={
                'ordering': ['-changed_at'],
            },
        ),
        migrations.CreateModel(
            name='GroceryOrderItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('custom_item_name', models.CharField(blank=True, max_length=200)),
                ('quantity', models.DecimalField(decimal_places=2, max_digits=10)),
                ('unit', models.CharField(choices=[('kg', 'Kilogram (kg)'), ('gram', 'Gram'), ('litre', 'Litre'), ('ml', 'Millilitre (ml)'), ('piece', 'Piece'), ('packet', 'Packet'), ('dozen', 'Dozen')], max_length=10)),
                ('notes', models.TextField(blank=True)),
                ('is_available', models.BooleanField(default=True)),
                ('alternative_suggestion', models.TextField(blank=True)),
                ('grocery_item', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='grocery.groceryitem')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='orders.groceryorder')),
            ],
        ),
    ]
