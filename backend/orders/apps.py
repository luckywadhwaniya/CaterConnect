from django.apps import AppConfig
from django.db import connection


class OrdersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'orders'

    def ready(self):
        """Self-heal SQLite database columns if migrations haven't run yet."""
        try:
            with connection.cursor() as cursor:
                # Check orders_groceryorder columns
                cursor.execute("PRAGMA table_info(orders_groceryorder);")
                existing_order_cols = {row[1] for row in cursor.fetchall()}

                if existing_order_cols:  # table exists
                    cols_to_add_order = [
                        ("subtotal_amount", "decimal(12,2) DEFAULT 0.00"),
                        ("tax_amount", "decimal(10,2) DEFAULT 0.00"),
                        ("delivery_charge", "decimal(10,2) DEFAULT 0.00"),
                        ("discount_amount", "decimal(10,2) DEFAULT 0.00"),
                        ("total_amount", "decimal(12,2) DEFAULT 0.00"),
                        ("is_billed", "bool DEFAULT 0"),
                        ("billed_at", "datetime NULL"),
                    ]
                    for col_name, col_type in cols_to_add_order:
                        if col_name not in existing_order_cols:
                            cursor.execute(f"ALTER TABLE orders_groceryorder ADD COLUMN {col_name} {col_type};")

                # Check orders_groceryorderitem columns
                cursor.execute("PRAGMA table_info(orders_groceryorderitem);")
                existing_item_cols = {row[1] for row in cursor.fetchall()}

                if existing_item_cols:  # table exists
                    cols_to_add_item = [
                        ("unit_price", "decimal(10,2) DEFAULT 0.00"),
                        ("total_price", "decimal(12,2) DEFAULT 0.00"),
                    ]
                    for col_name, col_type in cols_to_add_item:
                        if col_name not in existing_item_cols:
                            cursor.execute(f"ALTER TABLE orders_groceryorderitem ADD COLUMN {col_name} {col_type};")
        except Exception:
            pass
