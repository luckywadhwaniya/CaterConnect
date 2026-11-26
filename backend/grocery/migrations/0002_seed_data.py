# Generated data migration to seed categories and grocery items for CaterConnect
from django.db import migrations


SEED_DATA = [
    {
        'name': 'મસાલા વિભાગ',
        'name_en': 'Spices',
        'order': 1,
        'items': [
            {'name': 'તુવેરદાળ', 'name_en': 'Toor Dal', 'default_unit': 'kg'},
            {'name': 'ચોખા', 'name_en': 'Rice', 'default_unit': 'kg'},
            {'name': 'આંબલી', 'name_en': 'Tamarind', 'default_unit': 'kg'},
            {'name': 'રાઈ', 'name_en': 'Mustard Seeds', 'default_unit': 'kg'},
            {'name': 'સૂકી મેથી', 'name_en': 'Dry Fenugreek', 'default_unit': 'kg'},
            {'name': 'આખું જીરું', 'name_en': 'Cumin Seeds', 'default_unit': 'kg'},
            {'name': 'સૂકા મરચાં', 'name_en': 'Dry Red Chillies', 'default_unit': 'kg'},
            {'name': 'હીંગ નવજીવન', 'name_en': 'Asafoetida (Navjivan)', 'default_unit': 'kg'},
            {'name': 'ગોળ', 'name_en': 'Jaggery', 'default_unit': 'kg'},
            {'name': 'તીખા', 'name_en': 'Red Chilli Powder', 'default_unit': 'kg'},
            {'name': 'લવિંગ', 'name_en': 'Cloves', 'default_unit': 'kg'},
            {'name': 'બાદિયાન', 'name_en': 'Star Anise', 'default_unit': 'kg'},
            {'name': 'તજ', 'name_en': 'Cinnamon', 'default_unit': 'kg'},
            {'name': 'હળદર', 'name_en': 'Turmeric', 'default_unit': 'kg'},
            {'name': 'મરચું', 'name_en': 'Chilli', 'default_unit': 'kg'},
            {'name': 'ધાણાજીરું', 'name_en': 'Coriander Cumin Powder', 'default_unit': 'kg'},
            {'name': 'તમાલપત્ર', 'name_en': 'Bay Leaves', 'default_unit': 'kg'},
            {'name': 'કોઠબડી', 'name_en': 'Kothbadi', 'default_unit': 'kg'},
            {'name': 'અજમો', 'name_en': 'Carom Seeds', 'default_unit': 'kg'},
        ]
    },
    {
        'name': 'કઠોળ વિભાગ',
        'name_en': 'Pulses & Flour',
        'order': 2,
        'items': [
            {'name': 'વાલ', 'name_en': 'White Beans', 'default_unit': 'kg'},
            {'name': 'ઘઉંના ફાડા', 'name_en': 'Broken Wheat', 'default_unit': 'kg'},
            {'name': 'વડી', 'name_en': 'Vadi', 'default_unit': 'kg'},
            {'name': 'સફેદ ચોળી', 'name_en': 'White Cowpeas', 'default_unit': 'kg'},
            {'name': 'દેશી ચણા', 'name_en': 'Desi Chickpeas', 'default_unit': 'kg'},
            {'name': 'છોલે ચણા', 'name_en': 'Chole Chickpeas', 'default_unit': 'kg'},
            {'name': 'મગ મોટા', 'name_en': 'Whole Green Moong', 'default_unit': 'kg'},
            {'name': 'ચણાની દાળ', 'name_en': 'Chana Dal', 'default_unit': 'kg'},
            {'name': 'અડદની દાળ', 'name_en': 'Urad Dal', 'default_unit': 'kg'},
            {'name': 'મગછડી દાળ', 'name_en': 'Moong Chhaddi Dal', 'default_unit': 'kg'},
            {'name': 'ઘઉંનો લોટ ઝીણો', 'name_en': 'Fine Wheat Flour', 'default_unit': 'kg'},
            {'name': 'ઘઉંનો લોટ કરકરો', 'name_en': 'Coarse Wheat Flour', 'default_unit': 'kg'},
            {'name': 'મગની ફોતરાદાળ', 'name_en': 'Moong Dal (Split)', 'default_unit': 'kg'},
            {'name': 'મગદાળનો કરકરો લોટ', 'name_en': 'Coarse Moong Dal Flour', 'default_unit': 'kg'},
            {'name': 'બેસન કરકરો', 'name_en': 'Coarse Besan', 'default_unit': 'kg'},
        ]
    },
    {
        'name': 'અનાજ અને ખોરાક',
        'name_en': 'Grains & Food Items',
        'order': 3,
        'items': [
            {'name': 'બેસન ઝીણો આસોપાલવ', 'name_en': 'Fine Besan (Asopalav)', 'default_unit': 'kg'},
            {'name': 'બાજરીનો લોટ', 'name_en': 'Millet Flour', 'default_unit': 'kg'},
            {'name': 'સોજી', 'name_en': 'Semolina', 'default_unit': 'kg'},
            {'name': 'રાજગરાનો લોટ', 'name_en': 'Rajgira Flour', 'default_unit': 'kg'},
            {'name': 'પૌવા', 'name_en': 'Flattened Rice (Poha)', 'default_unit': 'kg'},
            {'name': 'સામો', 'name_en': 'Barnyard Millet', 'default_unit': 'kg'},
            {'name': 'આખી ખાંડ', 'name_en': 'Whole Sugar', 'default_unit': 'kg'},
            {'name': 'દળેલી ખાંડ', 'name_en': 'Powdered Sugar', 'default_unit': 'kg'},
            {'name': 'ચા ભૂકી', 'name_en': 'Tea Powder', 'default_unit': 'kg'},
            {'name': 'ચા નો મસાલો', 'name_en': 'Tea Masala', 'default_unit': 'kg'},
            {'name': 'કોફી', 'name_en': 'Coffee', 'default_unit': 'kg'},
            {'name': 'એલચાયચી દળેલી', 'name_en': 'Cardamom Powder', 'default_unit': 'kg'},
            {'name': 'સફેદ ગુંદર', 'name_en': 'White Gum', 'default_unit': 'kg'},
            {'name': 'ખસખસ', 'name_en': 'Poppy Seeds', 'default_unit': 'kg'},
            {'name': 'કાજુ ફાડા', 'name_en': 'Cashew Halves', 'default_unit': 'kg'},
            {'name': 'કાજુ ટુકડા', 'name_en': 'Cashew Pieces', 'default_unit': 'kg'},
            {'name': 'ફટકડી', 'name_en': 'Alum', 'default_unit': 'kg'},
            {'name': 'કિસમિસ', 'name_en': 'Raisins', 'default_unit': 'kg'},
            {'name': 'બદામ', 'name_en': 'Almonds', 'default_unit': 'kg'},
            {'name': 'પિસ્તા', 'name_en': 'Pistachios', 'default_unit': 'kg'},
            {'name': 'ચારોળી', 'name_en': 'Chironji', 'default_unit': 'kg'},
            {'name': 'તપકીર', 'name_en': 'Tapkir', 'default_unit': 'kg'},
            {'name': 'મગતરી', 'name_en': 'Magatari Seeds', 'default_unit': 'kg'},
            {'name': 'સીંગદાણા', 'name_en': 'Peanuts', 'default_unit': 'kg'},
            {'name': 'મીઠું નીરમા', 'name_en': 'Nirma Salt', 'default_unit': 'kg'},
            {'name': 'ઘી ડાલલા', 'name_en': 'Dalda Ghee', 'default_unit': 'kg'},
            {'name': 'ચોખ્ખું ઘી', 'name_en': 'Pure Ghee', 'default_unit': 'kg'},
            {'name': 'કપાશિયા તેલ', 'name_en': 'Cottonseed Oil', 'default_unit': 'litre'},
            {'name': 'સીંગતેલ', 'name_en': 'Groundnut Oil', 'default_unit': 'litre'},
            {'name': 'ખીચડીયા ચોખા', 'name_en': 'Khichdi Rice', 'default_unit': 'kg'},
            {'name': 'અડદનો કરકરો લોટ', 'name_en': 'Coarse Urad Flour', 'default_unit': 'kg'},
            {'name': 'જાયફળ', 'name_en': 'Nutmeg', 'default_unit': 'kg'},
            {'name': 'રમકડા', 'name_en': 'Ramkada', 'default_unit': 'kg'},
            {'name': 'સિકંદર સીંગ', 'name_en': 'Sikandar Peanuts', 'default_unit': 'kg'},
            {'name': 'તીખી સીંગ', 'name_en': 'Spicy Peanuts', 'default_unit': 'kg'},
            {'name': 'ચણા ના લોટ ની સેવ', 'name_en': 'Besan Sev', 'default_unit': 'kg'},
        ]
    },
    {
        'name': 'અન્ય સામગ્રી',
        'name_en': 'Other Items',
        'order': 4,
        'items': [
            {'name': 'સમોસા વેફર', 'name_en': 'Samosa Wafer', 'default_unit': 'kg'},
            {'name': 'ખાવાના સોડા (ટાટા)', 'name_en': 'Baking Soda (Tata)', 'default_unit': 'packet'},
            {'name': 'ધોવાના સોડા', 'name_en': 'Washing Soda', 'default_unit': 'packet'},
            {'name': 'લીંબુના ફૂલ', 'name_en': 'Citric Acid', 'default_unit': 'kg'},
            {'name': 'લિજ્જત પાપડ', 'name_en': 'Lijjat Papad', 'default_unit': 'kg'},
            {'name': 'ચોખા મીની પાપડ', 'name_en': 'Rice Mini Papad', 'default_unit': 'kg'},
            {'name': 'ખજૂર', 'name_en': 'Dates', 'default_unit': 'kg'},
            {'name': 'ટોસ બિસ્કિટ', 'name_en': 'Toast Biscuit', 'default_unit': 'packet'},
            {'name': 'આખા ધાણા', 'name_en': 'Whole Coriander', 'default_unit': 'kg'},
            {'name': 'સફેદ તલ', 'name_en': 'White Sesame Seeds', 'default_unit': 'kg'},
            {'name': 'વરિયાળી', 'name_en': 'Fennel Seeds', 'default_unit': 'kg'},
            {'name': 'રાઈના કુરિયા', 'name_en': 'Mustard Kuriya', 'default_unit': 'kg'},
            {'name': 'મેથીના કુરિયા', 'name_en': 'Fenugreek Kuriya', 'default_unit': 'kg'},
            {'name': 'તોપરાનું છીણ નાનું', 'name_en': 'Desiccated Coconut (Small)', 'default_unit': 'kg'},
            {'name': 'પાઉંભાજી મસાલો', 'name_en': 'Pav Bhaji Masala', 'default_unit': 'packet'},
            {'name': 'કીચન કિંગ મસાલો', 'name_en': 'Kitchen King Masala', 'default_unit': 'packet'},
            {'name': 'છોલેનો મસાલો', 'name_en': 'Chole Masala', 'default_unit': 'packet'},
            {'name': 'અડદિયાનો મસાલો', 'name_en': 'Adudiya Masala', 'default_unit': 'packet'},
            {'name': 'બાદશાહી ગરમ મસાલો', 'name_en': 'Badshahi Garam Masala', 'default_unit': 'packet'},
            {'name': 'બાદશાહી ચાટ મસાલો', 'name_en': 'Badshahi Chaat Masala', 'default_unit': 'packet'},
            {'name': 'કસ્તુરી મેથી', 'name_en': 'Kasuri Methi', 'default_unit': 'kg'},
            {'name': 'ટમેટો સોસ', 'name_en': 'Tomato Sauce', 'default_unit': 'ml'},
            {'name': 'સફેદ તીખા', 'name_en': 'White Chillies', 'default_unit': 'kg'},
            {'name': 'દાડિયા', 'name_en': 'Dadiya', 'default_unit': 'kg'},
            {'name': 'સંચળ પાવડર', 'name_en': 'Black Salt Powder', 'default_unit': 'kg'},
            {'name': 'બાકસ', 'name_en': 'Matchbox', 'default_unit': 'piece'},
            {'name': 'નિરમાની થેલી', 'name_en': 'Nirma Bag', 'default_unit': 'packet'},
            {'name': 'મુખવાસ', 'name_en': 'Mukhwas', 'default_unit': 'packet'},
            {'name': 'છાશનો મસાલો', 'name_en': 'Buttermilk Masala', 'default_unit': 'packet'},
            {'name': 'કેસર કલર', 'name_en': 'Saffron Color', 'default_unit': 'kg'},
            {'name': 'લીંબુ પીળો', 'name_en': 'Yellow Color', 'default_unit': 'kg'},
            {'name': 'લીલો કલર', 'name_en': 'Green Color', 'default_unit': 'kg'},
            {'name': 'ગુલાબી કલર', 'name_en': 'Pink Color', 'default_unit': 'kg'},
            {'name': 'મેંદો', 'name_en': 'Maida', 'default_unit': 'kg'},
            {'name': 'કાળા મરી પાવડર', 'name_en': 'Black Pepper Powder', 'default_unit': 'kg'},
            {'name': 'સફેદ મરી પાવડર', 'name_en': 'White Pepper Powder', 'default_unit': 'kg'},
            {'name': 'આજીનો મોટો', 'name_en': 'Ajinomoto', 'default_unit': 'kg'},
            {'name': 'રેડ ચીલી સોસ', 'name_en': 'Red Chilli Sauce', 'default_unit': 'ml'},
            {'name': 'ગ્રીન ચીલી સોસ', 'name_en': 'Green Chilli Sauce', 'default_unit': 'ml'},
            {'name': 'વીનેગર', 'name_en': 'Vinegar', 'default_unit': 'ml'},
            {'name': 'સોયાસોસ', 'name_en': 'Soy Sauce', 'default_unit': 'ml'},
            {'name': 'નૂડલ્સ', 'name_en': 'Noodles', 'default_unit': 'packet'},
        ]
    },
    {
        'name': 'પ્લાસ્ટિક આઇટમ વિભાગ',
        'name_en': 'Plastic & Disposables',
        'order': 5,
        'items': [
            {'name': 'પેપર નેપકીન', 'name_en': 'Paper Napkin', 'default_unit': 'packet'},
            {'name': 'છાશના પ્યાલા', 'name_en': 'Buttermilk Cups', 'default_unit': 'packet'},
            {'name': 'ચાની પાલી', 'name_en': 'Tea Cups', 'default_unit': 'packet'},
            {'name': 'પેપર ડીશ', 'name_en': 'Paper Plate', 'default_unit': 'packet'},
            {'name': 'ત્રણ ખાનાં ડીશ', 'name_en': 'Three Section Plate', 'default_unit': 'packet'},
            {'name': 'દિલ્હી ચાટ વાટકી', 'name_en': 'Delhi Chaat Bowl', 'default_unit': 'packet'},
            {'name': 'ફ્રાય મેન્યુ. વાટકી', 'name_en': 'Fry Menu Bowl', 'default_unit': 'packet'},
            {'name': 'કાંટા ચમચી', 'name_en': 'Fork Spoon Set', 'default_unit': 'packet'},
            {'name': 'સાદી ચમચી', 'name_en': 'Plain Spoon', 'default_unit': 'packet'},
            {'name': 'સુપની પ્યાલી', 'name_en': 'Soup Cup', 'default_unit': 'packet'},
            {'name': 'સુપની ચમચી', 'name_en': 'Soup Spoon', 'default_unit': 'packet'},
            {'name': 'સિલ્વર રોલ', 'name_en': 'Silver Foil Roll', 'default_unit': 'piece'},
        ]
    }
]


def seed_grocery_data(apps, schema_editor):
    GroceryCategory = apps.get_model('grocery', 'GroceryCategory')
    GroceryItem = apps.get_model('grocery', 'GroceryItem')

    for cat_data in SEED_DATA:
        items_data = cat_data.pop('items')
        category, _ = GroceryCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'name_en': cat_data['name_en'],
                'order': cat_data['order'],
                'is_active': True,
            }
        )
        cat_data['items'] = items_data

        for idx, item_data in enumerate(items_data, start=1):
            GroceryItem.objects.get_or_create(
                category=category,
                name=item_data['name'],
                defaults={
                    'name_en': item_data.get('name_en', ''),
                    'default_unit': item_data.get('default_unit', 'kg'),
                    'order': idx,
                    'is_active': True,
                }
            )


def reverse_seed_data(apps, schema_editor):
    GroceryCategory = apps.get_model('grocery', 'GroceryCategory')
    category_names = [cat['name'] for cat in SEED_DATA]
    GroceryCategory.objects.filter(name__in=category_names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('grocery', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_grocery_data, reverse_seed_data),
    ]
