# Use the official AWS Lambda Python 3.12 base image
FROM public.ecr.aws/lambda/python:3.12

COPY requirements.txt .


RUN pip install --upgrade -r requirements.txt -t ./package


RUN cd package && zip -r /deployment-package.zip .