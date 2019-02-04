FROM node:10

# Create app directory

WORKDIR /usr/src/app

# Install app

RUN mkdir Backend

COPY Backend/package*.json Backend/

RUN mkdir Frontend

COPY Frontend/package*.json Frontend/

RUN cd Backend && npm i

RUN cd Frontend && npm i

COPY . .

# Expose the right ports, the commands below are irrelevant when using a docker-compose file.

EXPOSE 3000
EXPOSE 8080
CMD ["npm", "start"]
