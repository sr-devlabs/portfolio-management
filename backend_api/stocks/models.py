from django.db import models


class Stock(models.Model):
    stock_id = models.AutoField(primary_key=True)
    stock_name = models.CharField(max_length=100)
    stock_ticker = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    def __str__(self):
        return self.stock_name
