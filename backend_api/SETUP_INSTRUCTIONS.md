## Stock Price Prediction Django backend setup ##

==========================================================================

1. Activate the environment: conda activate tf-gpu

2. Install Django: 
	conda install -c conda-forge django=4.2.16
   (note:- this will install Django 4.2.16, *Use this version*)

3. Install psycopg2-binary: 
	conda install -c conda-forge psycopg2-binary

4. Django Rest Framework: 
	conda install -c conda-forge djangorestframework

5. Django rest framework jwt token: 
	conda install djangorestframework-simplejwt

6. install donenv: 
	conda install -c conda-forge python-dotenv

7. install cors: 
	conda install -c conda-forge django-cors-headers

8. Run Django Project: (cd backend_api - to go in backen_api root django project file)
	Stock_prediction
		|-Documentation
		|-Extra
		|-backend_api  <-------------You are here :)
			|-backendapi
			|- ...otherthings
			

	python3 manage.py runserver
---------------------------------------------------------------------------



-------------------------don't perform this--------------------------------------------

1. Create Django Project - django-admin startproject backend_api
2. Run Django Project - python3 manage.py runserver
3. Everytime you make changes in models.py, do:	1) python manage.py make migrations
						2) python manage.py migrate
---------------------------------------------------------------------------------------
