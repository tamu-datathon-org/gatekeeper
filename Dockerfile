FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci

# copy app source
COPY src ./
COPY test ./

EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]
