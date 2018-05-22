# Video downloader

This is a simple repo, written in Node, to host your own video downloader website

## Requirements

* Node
* Docker
* Grunt

## Quickstart
To test locally

        grunt testLocal

To build the docker container

        grunt build

### Pushing

First, set the environment variable `DOCKER_TAG` to whatever tag you want for your docker container

Then, you can push to docker cloud registry (or whatever registry you use) via

        grunt pushDocker


### Config

The default port is 3000, so either change it, or set up your hosting config appropriately to expose port 3000

