from django.core.management.base import BaseCommand
from reviews.models import Station


class Command(BaseCommand):
    help = 'Add multiple stations to the database at once'

    def add_arguments(self, parser):
        parser.add_argument(
            '--stations',
            nargs='+',
            help='List of station names to add',
        )
        parser.add_argument(
            '--file',
            type=str,
            help='Path to a file containing station data (one per line, or CSV format: name,line,location)',
        )

    def handle(self, *args, **options):
        stations_to_add = []
        
        # If stations provided via command line
        if options['stations']:
            for station_name in options['stations']:
                stations_to_add.append({
                    'name': station_name,
                    'line': 'Blue Line',  # default
                    'location': ''
                })
        
        # If file provided
        elif options['file']:
            try:
                with open(options['file'], 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith('#'):
                            continue
                        
                        # Check if CSV format (name,line,location)
                        if ',' in line:
                            parts = [p.strip() for p in line.split(',')]
                            stations_to_add.append({
                                'name': parts[0],
                                'line': parts[1] if len(parts) > 1 else 'Blue Line',
                                'location': parts[2] if len(parts) > 2 else ''
                            })
                        else:
                            # Just station name
                            stations_to_add.append({
                                'name': line,
                                'line': 'Blue Line',
                                'location': ''
                            })
            except FileNotFoundError:
                self.stdout.write(self.style.ERROR(f'File not found: {options["file"]}'))
                return
        
        # If neither provided, use default list
        else:
            self.stdout.write(self.style.WARNING('No stations provided. Using default metro stations.'))
            default_stations = [
                'Rajiv Chowk', 'Kashmere Gate', 'Central Secretariat', 'New Delhi',
                'Dwarka Sector 21', 'Huda City Centre', 'Noida City Centre',
                'Vaishali', 'Anand Vihar', 'Yamuna Bank', 'Botanical Garden',
                'Kalkaji Mandir', 'Lajpat Nagar', 'Jangpura', 'Mandi House',
                'Barakhamba Road', 'Connaught Place', 'Patel Chowk', 'Rajiv Chowk',
                'New Delhi Railway Station', 'Shastri Park', 'Seelampur', 'Shahdara'
            ]
            for station_name in default_stations:
                stations_to_add.append({
                    'name': station_name,
                    'line': 'Blue Line',
                    'location': ''
                })
        
        # Add stations to database
        created_count = 0
        skipped_count = 0
        
        for station_data in stations_to_add:
            station, created = Station.objects.get_or_create(
                name=station_data['name'],
                defaults={
                    'line': station_data['line'],
                    'location': station_data['location']
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'[+] Created: {station.name}'))
            else:
                skipped_count += 1
                self.stdout.write(self.style.WARNING(f'[-] Skipped (already exists): {station.name}'))
        
        self.stdout.write(self.style.SUCCESS(
            f'\nSummary: {created_count} stations created, {skipped_count} stations skipped'
        ))

