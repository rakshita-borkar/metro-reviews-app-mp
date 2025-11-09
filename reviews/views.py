from rest_framework import viewsets, permissions
from .models import Station, Review, AspectRating
from .serializers import StationSerializer, ReviewSerializer
from .ml.absa_pipeline import ABSAPipeline   # <-- import your ABSA model pipeline


class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer
    permission_classes = [permissions.AllowAny]


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        """
        Save the review and automatically analyze its sentiment using the ABSA model.
        """
        review = serializer.save(user=self.request.user)

        # Load ABSA model
        pipeline = ABSAPipeline()

        # Predict sentiment for the review text
        try:
            sentiment = pipeline.predict(review.text)
        except Exception as e:
            sentiment = "error"
            print(f"ABSA model error: {e}")

        # Save the overall sentiment
        review.sentiment = sentiment
        review.save()

        # Optional: store one aspect-level sentiment (can be extended later)
        AspectRating.objects.create(
            review=review,
            aspect="overall",
            sentiment=sentiment
        )
