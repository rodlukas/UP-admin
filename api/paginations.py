from rest_framework.pagination import PageNumberPagination


class LecturePagination(PageNumberPagination):
    page_size = 15
