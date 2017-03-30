#!/usr/bin/env sh

docker run  --name="cachet-config" --rm -v `pwd`:/app rajasoun/python:0.1 python configure_components.py
