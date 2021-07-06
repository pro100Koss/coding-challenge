FROM alekzonder/puppeteer:latest

user root

workdir /usr/src/app

copy package*.json ./

run npm install

copy . .

cmd ["npm", "run", "dev"]

