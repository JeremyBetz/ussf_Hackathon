FROM node

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY api/package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY api /usr/src/app

EXPOSE 3000
CMD [ "npm", "start" ]
