FROM node:alpine

COPY package*.json /app/package*.json

RUN npm i 

COPY . . 