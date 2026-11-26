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
            name='CateringEvent',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('event_name', models.CharField(max_length=300)),
                ('event_date', models.DateField()),
                ('delivery_date', models.DateField()),
                ('delivery_time', models.TimeField()),
                ('event_location', models.TextField()),
                ('num_guests', models.IntegerField()),
                ('additional_instructions', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('catering_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-event_date'],
            },
        ),
    ]
