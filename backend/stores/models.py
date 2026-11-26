import uuid
from django.db import models
from django.conf import settings


class GroceryStore(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='store'
    )
    store_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['store_name']

    def __str__(self):
        return self.store_name
