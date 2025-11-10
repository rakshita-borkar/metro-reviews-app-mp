from rest_framework import serializers
from .models import Station, Review, AspectRating

class AspectRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AspectRating
        fields = ['id', 'aspect', 'sentiment']

class ReviewSerializer(serializers.ModelSerializer):
    aspects = AspectRatingSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'station', 'text', 'rating', 'sentiment', 'created_at', 'aspects']  # <-- include rating

class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = ['id', 'name', 'line', 'location']

class StatsSerializer(serializers.Serializer):
    overallRating = serializers.FloatField()
    totalReviews = serializers.IntegerField()
    reviewDistribution = serializers.DictField(child=serializers.IntegerField())
    aspects = serializers.DictField()
    recentTrends = serializers.DictField()
