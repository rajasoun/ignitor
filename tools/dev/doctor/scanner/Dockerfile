FROM python:alpine

VOLUME /app
WORKDIR /app

COPY requirements.txt  /app
COPY app.py /app

RUN pip install -r requirements.txt
RUN python app.py
