from django.core.management.base import BaseCommand
from reviews.models import Station, Review, AspectRating

class Command(BaseCommand):
    help = 'Delete all reviews except for specified stations'

    def handle(self, *args, **options):
        # Stations to keep
        keep_stations = ['Andheri', 'Azad Nagar', 'Western Express Highway']
        
        self.stdout.write(f"Keeping reviews from: {', '.join(keep_stations)}")
        self.stdout.write("Deleting reviews from all other stations...\n")
        
        # Get all stations except the ones we want to keep
        stations_to_clear = Station.objects.exclude(name__in=keep_stations)
        
        total_reviews_deleted = 0
        total_aspects_deleted = 0
        
        for station in stations_to_clear:
            # Get review and aspect count for this station
            review_count = Review.objects.filter(station=station).count()
            aspect_count = AspectRating.objects.filter(review__station=station).count()
            
            if review_count > 0:
                self.stdout.write(f"Deleting from '{station.name}':")
                self.stdout.write(f"  - Reviews: {review_count}")
                self.stdout.write(f"  - Aspect ratings: {aspect_count}")
                
                # Delete all reviews (aspects will cascade delete)
                Review.objects.filter(station=station).delete()
                
                total_reviews_deleted += review_count
                total_aspects_deleted += aspect_count
                
                self.stdout.write(self.style.SUCCESS(f"  ✓ Deleted\n"))
        
        # Show summary for kept stations
        self.stdout.write(self.style.SUCCESS("\n=== SUMMARY ==="))
        self.stdout.write(f"Total reviews deleted: {total_reviews_deleted}")
        self.stdout.write(f"Total aspect ratings deleted: {total_aspects_deleted}\n")
        
        self.stdout.write(self.style.SUCCESS("Remaining reviews by station:"))
        for station_name in keep_stations:
            station = Station.objects.get(name=station_name)
            review_count = Review.objects.filter(station=station).count()
            aspect_count = AspectRating.objects.filter(review__station=station).count()
            self.stdout.write(f"  - {station.name}: {review_count} reviews, {aspect_count} aspect ratings")
