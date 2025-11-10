from django.db import models
from django.contrib.auth.models import User

class Station(models.Model):
    name = models.CharField(max_length=100, unique=True)
    line = models.CharField(max_length=50, default='Blue Line')
    location = models.CharField(max_length=150, blank=True)

    def __str__(self):
        return self.name

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='reviews')
    text = models.TextField()
    rating = models.IntegerField(default=3)  # <-- add this
    created_at = models.DateTimeField(auto_now_add=True)
    sentiment = models.CharField(max_length=20, blank=True)  # overall sentiment

    def __str__(self):
        return f"{self.user.username} - {self.station.name}"


class AspectRating(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='aspects')
    aspect = models.CharField(max_length=50)
    sentiment = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.aspect} - {self.sentiment}"
