FROM mcr.microsoft.com/playwright:v1.36.0-jammy

RUN mkdir -p /documentation

WORKDIR /e2e

COPY package*.json /e2e
RUN npm install

COPY ../csc-ui-documentation/package*.json /documentation
RUN cd ../documentation && npm install && cd ..

# copy project (including tests)
COPY . /e2e
COPY ../csc-ui-documentation /documentation

RUN npx playwright install

# Run playwright test
# CMD npx playwright test --reporter=list
