from django.core.management.base import BaseCommand
from reviews.models import Review
from reviews.views import analyze_review_aspects


class Command(BaseCommand):
    help = 'Analyze all existing reviews and store aspect ratings in database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            help='Limit the number of reviews to process',
        )
        parser.add_argument(
            '--station',
            type=int,
            help='Only process reviews for a specific station ID',
        )

    def handle(self, *args, **options):
        # Get reviews to process
        reviews = Review.objects.all()
        
        if options['station']:
            reviews = reviews.filter(station_id=options['station'])
        
        if options['limit']:
            reviews = reviews[:options['limit']]
        
        total = reviews.count()
        self.stdout.write(f'Processing {total} reviews...')
        
        processed = 0
        errors = 0
        
        for review in reviews:
            try:
                analyze_review_aspects(review)
                processed += 1
                if processed % 10 == 0:
                    self.stdout.write(f'Processed {processed}/{total} reviews...')
            except Exception as e:
                errors += 1
                self.stdout.write(self.style.ERROR(f'Error processing review {review.id}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(
            f'\nCompleted: {processed} reviews processed, {errors} errors'
        ))

