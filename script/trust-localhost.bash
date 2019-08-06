#!/bin/bash
openssl s_client -showcerts -connect localhost:3000 </dev/null 2>/dev/null|openssl x509 -outform PEM >/tmp/localhost.pem
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain /tmp/localhost.pem 
