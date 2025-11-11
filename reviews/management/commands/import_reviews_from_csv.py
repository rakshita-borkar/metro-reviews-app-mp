from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import csv
import os
import re
from reviews.models import Station, Review, AspectRating


class Command(BaseCommand):
    help = 'Import reviews from CSV files for specific stations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            required=True,
            help='Path to CSV file',
        )
        parser.add_argument(
            '--station',
            type=str,
            required=True,
            help='Station name (must match exactly)',
        )

    def parse_relative_date(self, relative_d):
        """Convert relative date string like '5 months' to actual date."""
        if not relative_d or relative_d.strip() == '':
            return timezone.now()
        
        # Extract number and unit
        match = re.match(r'(\d+)\s*(month|day|week|year)', relative_d.lower())
        if not match:
            return timezone.now()
        
        number = int(match.group(1))
        unit = match.group(2)
        
        now = timezone.now()
        if unit == 'day':
            return now - timedelta(days=number)
        elif unit == 'week':
            return now - timedelta(weeks=number)
        elif unit == 'month':
            return now - timedelta(days=number * 30)  # Approximate
        elif unit == 'year':
            return now - timedelta(days=number * 365)
        
        return now

    def map_csv_aspect_to_db_aspect(self, csv_aspect):
        """Map CSV aspect names to our database aspect names."""
        mapping = {
            'Metro con': 'Facilities',  # Metro connectivity -> Facilities
            'Metro stat': 'Facilities',  # Metro station -> Facilities
            'General Sa': 'Safety',  # General safety -> Safety
            'Crowd ma': 'Crowd',  # Crowd management -> Crowd
            'Ticketing s': 'Service',  # Ticketing system -> Service
            "Women's": 'Safety',  # Women's safety -> Safety
            'Metro fre': 'Service',  # Metro frequency -> Service
            'Staff beha': 'Service',  # Staff behavior -> Service
            'Cleanliness': 'Cleanliness',  # Direct match
        }
        return mapping.get(csv_aspect, None)

    def handle(self, *args, **options):
        file_path = options['file']
        station_name = options['station']
        
        # Check if file exists
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return
        
        # Get or create station
        try:
            station = Station.objects.get(name=station_name)
        except Station.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Station not found: {station_name}'))
            self.stdout.write('Available stations:')
            for s in Station.objects.all():
                self.stdout.write(f'  - {s.name}')
            return
        
        # Aspect columns in CSV
        aspect_columns = [
            'Metro con', 'Metro stat', 'General Sa', 'Crowd ma',
            'Ticketing s', "Women's", 'Metro fre', 'Staff beha', 'Cleanliness'
        ]
        
        created_count = 0
        skipped_count = 0
        error_count = 0
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                # Try to detect delimiter
                sample = f.read(1024)
                f.seek(0)
                sniffer = csv.Sniffer()
                delimiter = sniffer.sniff(sample).delimiter
                
                reader = csv.DictReader(f, delimiter=delimiter)
                
                for row_num, row in enumerate(reader, 1):
                    try:
                        # Get review data
                        caption = row.get('caption', '').strip()
                        if not caption:
                            skipped_count += 1
                            continue
                        
                        rating_str = row.get('rating', '3').strip()
                        try:
                            rating = int(float(rating_str))
                        except (ValueError, TypeError):
                            rating = 3
                        
                        username = row.get('username', '').strip()
                        if not username:
                            username = 'anonymous'
                        
                        # Parse date
                        relative_d = row.get('relative_d', '').strip()
                        created_at = self.parse_relative_date(relative_d)
                        
                        # Get or create user
                        user, _ = User.objects.get_or_create(
                            username=username,
                            defaults={
                                'email': f'{username}@example.com',
                                'first_name': username.split()[0] if username.split() else 'User',
                                'last_name': ' '.join(username.split()[1:]) if len(username.split()) > 1 else ''
                            }
                        )
                        
                        # Create review
                        review = Review.objects.create(
                            user=user,
                            station=station,
                            text=caption,
                            rating=rating,
                            created_at=created_at
                        )
                        
                        # Process aspect ratings from CSV (already analyzed, just import)
                        for csv_aspect in aspect_columns:
                            sentiment = row.get(csv_aspect, '').strip().lower()
                            
                            # Skip if NA or empty
                            if not sentiment or sentiment == 'na':
                                continue
                            
                            # Map to our aspect names
                            db_aspect = self.map_csv_aspect_to_db_aspect(csv_aspect)
                            if not db_aspect:
                                continue
                            
                            # Map sentiment
                            if sentiment == 'positive':
                                db_sentiment = 'Positive'
                            elif sentiment == 'negative':
                                db_sentiment = 'Negative'
                            else:
                                db_sentiment = 'Neutral'
                            
                            # Create aspect rating (bulk create would be faster but this is simpler)
                            AspectRating.objects.create(
                                review=review,
                                aspect=db_aspect,
                                sentiment=db_sentiment
                            )
                        
                        created_count += 1
                        
                        if created_count % 10 == 0:
                            self.stdout.write(f'Processed {created_count} reviews...')
                    
                    except Exception as e:
                        error_count += 1
                        self.stdout.write(self.style.ERROR(
                            f'Error processing row {row_num}: {str(e)}'
                        ))
                        continue
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error reading file: {str(e)}'))
            return
        
        self.stdout.write(self.style.SUCCESS(
            f'\nImport completed for {station_name}:'
        ))
        self.stdout.write(self.style.SUCCESS(
            f'  {created_count} reviews created'
        ))
        self.stdout.write(self.style.WARNING(
            f'  {skipped_count} rows skipped (empty caption)'
        ))
        if error_count > 0:
            self.stdout.write(self.style.ERROR(
                f'  {error_count} errors'
            ))

