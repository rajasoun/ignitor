FROM golang:1.8-alpine
ENV PORT 8000

ADD http.go /app/http.go

WORKDIR /app
RUN go build -o http

EXPOSE 8000

CMD ["/app/http"]
