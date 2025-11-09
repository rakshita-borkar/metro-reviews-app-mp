from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StationViewSet, ReviewViewSet
from .auth_views import register_user


router = DefaultRouter()
router.register(r'stations', StationViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register_user),

]
