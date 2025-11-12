from django.core.management.base import BaseCommand
from reviews.models import Station, Review, AspectRating

class Command(BaseCommand):
    help = 'Delete specified stations and all their associated reviews and aspects'

    def add_arguments(self, parser):
        parser.add_argument(
            '--stations',
            type=str,
            help='Comma-separated list of station names to delete'
        )

    def handle(self, *args, **options):
        station_names = ['stations', 'central', 'north', 'south']
        
        self.stdout.write(f"Deleting stations: {', '.join(station_names)}")
        
        for station_name in station_names:
            try:
                station = Station.objects.get(name__iexact=station_name)
                
                # Get review count
                review_count = Review.objects.filter(station=station).count()
                
                # Get aspect rating count
                aspect_count = AspectRating.objects.filter(review__station=station).count()
                
                self.stdout.write(f"\nDeleting '{station.name}' (ID: {station.id})")
                self.stdout.write(f"  - Reviews: {review_count}")
                self.stdout.write(f"  - Aspect ratings: {aspect_count}")
                
                # Delete all reviews and aspects (cascade will handle aspects)
                Review.objects.filter(station=station).delete()
                
                # Delete the station
                station.delete()
                
                self.stdout.write(self.style.SUCCESS(f"  ✓ Station '{station_name}' deleted successfully"))
                
            except Station.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"Station '{station_name}' not found"))
        
        # Show remaining stations
        remaining_count = Station.objects.count()
        self.stdout.write(f"\n{self.style.SUCCESS('Deletion complete!')} Remaining stations: {remaining_count}")
        
        remaining_stations = Station.objects.all().order_by('name')
        for station in remaining_stations:
            review_count = Review.objects.filter(station=station).count()
            self.stdout.write(f"  - {station.name}: {review_count} reviews")
