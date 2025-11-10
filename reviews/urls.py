from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StationViewSet, ReviewViewSet, station_stats
from .auth_views import register_user
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'stations', StationViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register_user),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('stations/<int:station_id>/stats/', station_stats, name='station-stats'),
]
