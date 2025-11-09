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
        fields = ['id', 'user', 'station', 'text', 'sentiment', 'created_at', 'aspects']

class StationSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Station
        fields = ['id', 'name', 'line', 'location', 'reviews']
