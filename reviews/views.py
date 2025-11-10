from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Avg, Count
from .models import Station, Review, AspectRating
from .serializers import StationSerializer, ReviewSerializer, StatsSerializer
from .ml.absa_pipeline import ABSAPipeline
from .ml.absa_pipeline import get_aspect_sentiments
from rest_framework.permissions import AllowAny


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

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# ---------- Stats endpoint ----------
@api_view(['GET'])
@permission_classes([AllowAny])
def station_stats(request, station_id):
    reviews = Review.objects.filter(station_id=station_id)
    total_reviews = reviews.count()
    overall_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 0

    review_dist_dict = {r['rating']: r['count'] for r in reviews.values('rating').annotate(count=Count('rating'))}

    all_texts = [r.text for r in reviews]
    aspects = get_aspect_sentiments(all_texts)  # returns {aspect: {sentiment, percentage, trend}}

    recent_trends = {
        "thisMonth": reviews.filter(created_at__month=request.data.get('month', 11)).count(),
        "lastMonth": reviews.filter(created_at__month=request.data.get('month', 10)).count(),
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
