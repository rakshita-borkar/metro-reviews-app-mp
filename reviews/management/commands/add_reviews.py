from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from reviews.models import Station, Review
from datetime import datetime


class Command(BaseCommand):
    help = 'Add multiple reviews to stations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            help='Path to a file containing reviews (CSV format: station_name,text,rating,username)',
        )
        parser.add_argument(
            '--user',
            type=str,
            default='admin',
            help='Username to use for reviews (default: admin). User will be created if it does not exist.',
        )
        parser.add_argument(
            '--station',
            type=str,
            help='Station name to add reviews to (use with --reviews)',
        )
        parser.add_argument(
            '--reviews',
            nargs='+',
            help='List of review texts to add (use with --station)',
        )

    def handle(self, *args, **options):
        reviews_to_add = []
        
        # Get or create user
        username = options['user']
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': f'{username}@example.com'}
        )
        if created:
            user.set_password('password123')  # Default password
            user.save()
            self.stdout.write(self.style.SUCCESS(f'[+] Created user: {username}'))
        else:
            self.stdout.write(self.style.WARNING(f'[-] Using existing user: {username}'))
        
        # If file provided
        if options['file']:
            try:
                with open(options['file'], 'r', encoding='utf-8') as f:
                    for line_num, line in enumerate(f, 1):
                        line = line.strip()
                        if not line or line.startswith('#'):
                            continue
                        
                        # CSV format: station_name,text,rating,username (username optional)
                        if ',' in line:
                            parts = [p.strip() for p in line.split(',')]
                            if len(parts) < 2:
                                self.stdout.write(self.style.ERROR(f'Line {line_num}: Invalid format. Need at least station_name,text'))
                                continue
                            
                            station_name = parts[0]
                            review_text = parts[1]
                            rating = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 3
                            review_user = User.objects.get_or_create(
                                username=parts[3] if len(parts) > 3 else username,
                                defaults={'email': f'{parts[3] if len(parts) > 3 else username}@example.com'}
                            )[0]
                            
                            reviews_to_add.append({
                                'station_name': station_name,
                                'text': review_text,
                                'rating': rating,
                                'user': review_user
                            })
                        else:
                            self.stdout.write(self.style.ERROR(f'Line {line_num}: Invalid format. Use CSV: station_name,text,rating,username'))
            except FileNotFoundError:
                self.stdout.write(self.style.ERROR(f'File not found: {options["file"]}'))
                return
        
        # If station and reviews provided via command line
        elif options['station'] and options['reviews']:
            station_name = options['station']
            for review_text in options['reviews']:
                reviews_to_add.append({
                    'station_name': station_name,
                    'text': review_text,
                    'rating': 3,  # default
                    'user': user
                })
        
        # If neither provided, show help
        else:
            self.stdout.write(self.style.WARNING('No reviews provided.'))
            self.stdout.write('Usage examples:')
            self.stdout.write('  python manage.py add_reviews --station "Versova" --reviews "Great station!" "Very clean"')
            self.stdout.write('  python manage.py add_reviews --file reviews.csv')
            self.stdout.write('')
            self.stdout.write('CSV format: station_name,review_text,rating,username')
            self.stdout.write('Example: Versova,Great station with good connectivity,5,user1')
            return
        
        # Add reviews to database
        created_count = 0
        error_count = 0
        
        for review_data in reviews_to_add:
            try:
                # Find station by name
                try:
                    station = Station.objects.get(name=review_data['station_name'])
                except Station.DoesNotExist:
                    self.stdout.write(self.style.ERROR(f'[!] Station not found: {review_data["station_name"]}'))
                    error_count += 1
                    continue
                
                # Create review
                review = Review.objects.create(
                    station=station,
                    user=review_data['user'],
                    text=review_data['text'],
                    rating=review_data['rating']
                )
                created_count += 1
                self.stdout.write(self.style.SUCCESS(
                    f'[+] Created review for {station.name} by {review_data["user"].username}: "{review_data["text"][:50]}..."'
                ))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'[!] Error creating review: {str(e)}'))
                error_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'\nSummary: {created_count} reviews created, {error_count} errors'
        ))

