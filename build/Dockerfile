FROM node:7.10
COPY /src /src
WORKDIR "/src"
RUN npm install --production
EXPOSE 3000
CMD ["nodejs", "server.js"]
