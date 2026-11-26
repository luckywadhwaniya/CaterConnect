import uuid
from django.db import models
from django.conf import settings


class CateringEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    catering_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='events'
    )
    event_name = models.CharField(max_length=300)
    event_date = models.DateField()
    delivery_date = models.DateField()
    delivery_time = models.TimeField()
    event_location = models.TextField()
    num_guests = models.IntegerField()
    additional_instructions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-event_date']

    def __str__(self):
        return f"{self.event_name} ({self.event_date})"
