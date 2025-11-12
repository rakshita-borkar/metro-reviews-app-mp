from django.core.management.base import BaseCommand
from reviews.models import AspectRating
from collections import defaultdict

class Command(BaseCommand):
    help = 'Standardize all aspects to 9 new aspect names'

    def handle(self, *args, **options):
        # Define all 9 aspects
        all_aspects = [
            "Metro Station Connectivity",
            "Metro station infrastructure",
            "General Safety",
            "Crowd management",
            "Ticketing system",
            "Women's Safety",
            "Metro frequency",
            "Staff behavior",
            "Cleanliness"
        ]

        # Mapping for old aspect names to new ones
        aspect_name_mapping = {
            "Facilities": "Metro station infrastructure",
            "Safety": "General Safety",
            "Crowd": "Crowd management",
            "Service": "Ticketing system",
        }

        self.stdout.write("Starting aspect standardization...")

        # Get all unique aspects currently in DB
        unique_aspects = AspectRating.objects.values_list('aspect', flat=True).distinct()
        self.stdout.write(f"Found {len(unique_aspects)} unique aspects in DB:")
        for aspect in sorted(unique_aspects):
            count = AspectRating.objects.filter(aspect=aspect).count()
            self.stdout.write(f"  - {aspect}: {count} ratings")

        # Update old aspect names to new ones
        for old_name, new_name in aspect_name_mapping.items():
            count = AspectRating.objects.filter(aspect=old_name).count()
            if count > 0:
                AspectRating.objects.filter(aspect=old_name).update(aspect=new_name)
                self.stdout.write(f"Updated {count} ratings: {old_name} → {new_name}")

        self.stdout.write("\nAspect standardization complete!")
        
        # Show final stats
        unique_aspects = AspectRating.objects.values_list('aspect', flat=True).distinct()
        self.stdout.write(f"\nFinal aspect list ({len(unique_aspects)} unique):")
        for aspect in sorted(unique_aspects):
            count = AspectRating.objects.filter(aspect=aspect).count()
            self.stdout.write(f"  - {aspect}: {count} ratings")
