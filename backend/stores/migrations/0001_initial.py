import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='GroceryStore',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('store_name', models.CharField(max_length=200)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('address', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('owner', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='store', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['store_name'],
            },
        ),
    ]
