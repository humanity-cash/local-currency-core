#!/bin/bash
pip install --upgrade awsebcli
export AWS_EB_PROFILE=humanity-cash-deployer
eb init
eb create