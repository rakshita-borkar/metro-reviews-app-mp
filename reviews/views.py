from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Avg, Count
from django.contrib.auth.models import User
from .models import Station, Review, AspectRating
from .serializers import StationSerializer, ReviewSerializer, StatsSerializer
from .ml.absa_pipeline import ABSAPipeline
from .ml.absa_pipeline import get_aspect_sentiments
from rest_framework.permissions import AllowAny
import threading
from rest_framework.decorators import api_view


@api_view(['GET'])
def whoami(request):
    user = request.user
    if user and user.is_authenticated:
        return Response({'username': user.username, 'is_staff': user.is_staff})
    return Response({'username': None, 'is_staff': False})


# ---------- Station viewset ----------
class StationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    #authentication_classes = [JWTAuthentication]
    authentication_classes = []
    permission_classes = [AllowAny]
    #permission_classes = [permissions.IsAuthenticated]

# ---------- Review viewset ----------
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    #authentication_classes = [JWTAuthentication]
    #permission_classes = [permissions.IsAuthenticated]
    authentication_classes = []
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Review.objects.select_related('user', 'station').order_by('-created_at')
        station_id = self.request.query_params.get('station', None)
        if station_id:
            queryset = queryset.filter(station_id=station_id)
        return queryset
    
    def list(self, request, *args, **kwargs):
        # Get limit and offset from query params
        limit = request.query_params.get('limit', None)
        offset = request.query_params.get('offset', 0)
        
        queryset = self.filter_queryset(self.get_queryset())
        
        # Apply pagination if limit is provided
        if limit:
            try:
                limit = int(limit)
                offset = int(offset)
                total_count = queryset.count()
                queryset = queryset[offset:offset + limit]
                
                # Serialize the queryset
                serializer = self.get_serializer(queryset, many=True)
                
                # Return with pagination info
                return Response({
                    'results': serializer.data,
                    'count': total_count,
                    'next': f'?limit={limit}&offset={offset + limit}' if offset + limit < total_count else None,
                    'previous': f'?limit={limit}&offset={max(0, offset - limit)}' if offset > 0 else None,
                })
            except (ValueError, TypeError):
                pass
        
        # Default behavior (no pagination)
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Handle case where user is not authenticated
        if self.request.user.is_authenticated:
            user = self.request.user
        else:
            # Get or create a default anonymous user for unauthenticated reviews
            user, _ = User.objects.get_or_create(
                username='anonymous',
                defaults={
                    'email': 'anonymous@example.com',
                    'first_name': 'Anonymous',
                    'last_name': 'User'
                }
            )
        review = serializer.save(user=user)

        # Analyze aspects and store in database synchronously so the client
        # sees aspect badges and updated stats immediately after creation.
        try:
            analyze_review_aspects(review)
        except Exception as e:
            # Log error but don't break the review creation
            print(f"Error analyzing aspects for review {review.id}: {e}")

    def destroy(self, request, *args, **kwargs):
        """Allow deletion only by the review author or staff users."""
        instance = self.get_object()
        # request.user may be AnonymousUser if not authenticated
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_403_FORBIDDEN)
        # Allow if staff or owner
        if user.is_staff or instance.user == user:
            return super().destroy(request, *args, **kwargs)
        return Response({'detail': 'You do not have permission to delete this review.'}, status=status.HTTP_403_FORBIDDEN)

# ---------- Stats endpoint ----------
@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def station_stats(request, station_id):
    reviews = Review.objects.filter(station_id=station_id)
    total_reviews = reviews.count()
    
    # Calculate average rating, default to 0 if no reviews
    if total_reviews > 0:
        overall_rating = reviews.aggregate(avg=Avg('rating'))['avg']
        # Ensure it's a float, not None
        overall_rating = float(overall_rating) if overall_rating is not None else 0.0
    else:
        overall_rating = 0.0

    # Build review distribution with integer keys
    review_dist_dict = {}
    if total_reviews > 0:
        for r in reviews.values('rating').annotate(count=Count('rating')):
            review_dist_dict[int(r['rating'])] = int(r['count'])

    # Get aspect sentiments from database (much faster than ML processing)
    aspects = get_aspects_from_db(reviews)

    # Calculate recent trends (using current month from datetime)
    from datetime import datetime
    current_month = datetime.now().month
    recent_trends = {
        "thisMonth": reviews.filter(created_at__month=current_month).count(),
        "lastMonth": reviews.filter(created_at__month=current_month - 1 if current_month > 1 else 12).count(),
        "sentiment": "Positive"  # optional: compute overall sentiment
    }

    data = {
        "overallRating": overall_rating,
        "totalReviews": total_reviews,
        "reviewDistribution": review_dist_dict,
        "aspects": aspects,
        "recentTrends": recent_trends
    }
    return Response(data)


# Helper function to analyze a review and store aspects in database
def analyze_review_aspects(review):
    """Analyze a review's aspects using ML and store results in database."""
    from .ml.absa_pipeline import absa
    
    # Delete existing aspect ratings for this review
    AspectRating.objects.filter(review=review).delete()
    
    # Step 1: Detect which aspects are mentioned in the review
    detected_aspects = absa.detect_aspects(review.text)
    
    # Step 2: For each detected aspect, predict sentiment
    for aspect in detected_aspects:
        try:
            label = absa.predict_aspect_sentiment(review.text, aspect)
            # Normalize label
            if not label or label == "0":
                label = "Neutral"
            else:
                label = str(label).strip().capitalize()
                if label not in ["Positive", "Negative", "Neutral"]:
                    label = "Neutral"
            
            # Store in database
            AspectRating.objects.create(
                review=review,
                aspect=aspect,
                sentiment=label
            )
        except Exception as e:
            # If analysis fails, default to Neutral
            AspectRating.objects.create(
                review=review,
                aspect=aspect,
                sentiment="Neutral"
            )


# Helper function to get aspects from database
def get_aspects_from_db(reviews):
    """Get aspect sentiments aggregated from database."""
    from collections import defaultdict
    
    # Define all 9 aspects - always return all of them in consistent order
    all_aspects = [
        "Cleanliness",
        "Crowd management",
        "General Safety",
        "Metro frequency",
        "Metro Station Connectivity",
        "Metro station infrastructure",
        "Staff behavior",
        "Ticketing system",
        "Women's Safety"
    ]
    
    # Get all aspect ratings for these reviews
    aspect_ratings = AspectRating.objects.filter(review__in=reviews)
    
    # Aggregate by aspect and sentiment
    aspect_scores = defaultdict(lambda: {"Positive": 0, "Negative": 0, "Neutral": 0, "count": 0})
    
    for ar in aspect_ratings:
        sentiment = ar.sentiment.capitalize()
        if sentiment not in ["Positive", "Negative", "Neutral"]:
            sentiment = "Neutral"
        aspect_scores[ar.aspect][sentiment] += 1
        aspect_scores[ar.aspect]["count"] += 1
    
    # Format result - always include all 9 aspects in consistent order
    result = {}
    for aspect in all_aspects:
        scores = aspect_scores[aspect]
        total = scores["count"]
        
        if total == 0:
            # No reviews for this aspect yet - default to Neutral with 0%
            result[aspect] = {
                "sentiment": "Neutral",
                "percentage": 0,
                "trend": "stable"
            }
        else:
            pos_pct = int(scores["Positive"] / total * 100)
            neg_pct = int(scores["Negative"] / total * 100)
            neut_pct = 100 - pos_pct - neg_pct  # Ensure percentages add up to 100
            dominant = max(["Positive", "Negative", "Neutral"], key=lambda x: scores[x])
            result[aspect] = {
                "sentiment": dominant,
                "percentage": pos_pct if dominant == "Positive" else neg_pct if dominant == "Negative" else neut_pct,
                "trend": "stable"
            }
    
    return result
