#!/bin/bash
filename=$1
hugo new post/$(date +%b-%d-%Y)-$filename.md
