from django.contrib import admin
from .models import GroceryCategory, GroceryItem


class GroceryItemInline(admin.TabularInline):
    model = GroceryItem
    extra = 1
    fields = ('name', 'name_en', 'default_unit', 'order', 'is_active')


@admin.register(GroceryCategory)
class GroceryCategoryAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'name', 'order', 'is_active', 'item_count')
    list_editable = ('order', 'is_active')
    search_fields = ('name', 'name_en')
    list_filter = ('is_active',)
    inlines = [GroceryItemInline]

    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = 'Total Items'


@admin.register(GroceryItem)
class GroceryItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_en', 'category', 'default_unit', 'order', 'is_active')
    list_editable = ('order', 'is_active', 'default_unit')
    list_filter = ('category', 'default_unit', 'is_active')
    search_fields = ('name', 'name_en', 'category__name', 'category__name_en')
    ordering = ('category', 'order', 'name')
