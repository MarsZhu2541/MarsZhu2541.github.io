#!/bin/bash
docker rmi marszhu2541/teamfight-tactics:1.0.0
docker build -t marszhu2541/teamfight-tactics:1.0.0 .
docker push marszhu2541/teamfight-tactics:1.0.0
docker run -p 8080:80 -d marszhu2541/teamfight-tactics:1.0.0
