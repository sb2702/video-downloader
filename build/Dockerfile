FROM    ubuntu:14.04
RUN apt-get update
RUN apt-get install -y nodejs
RUN apt-get update
RUN apt-get install -y npm
COPY /src /src
WORKDIR "/src"
EXPOSE 3000
CMD ["nodejs", "server.js"]
