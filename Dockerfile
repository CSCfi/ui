FROM mcr.microsoft.com/playwright:v1.39.0-jammy

RUN mkdir -p /e2e/packages/csc-ui
RUN mkdir -p /e2e/packages/csc-ui-documentation
RUN mkdir -p /e2e/packages/csc-ui-vue
RUN mkdir -p /e2e/packages/csc-ui-vue2

WORKDIR /e2e

RUN apt-get update && apt-get install -y build-essential

COPY ./packages/csc-ui/package*.json /e2e/packages/csc-ui/
COPY ./packages/csc-ui-documentation/package*.json /e2e/packages/csc-ui-documentation/
COPY ./packages/csc-ui-vue/package*.json /e2e/packages/csc-ui-vue/
COPY ./packages/csc-ui-vue2/package*.json /e2e/packages/csc-ui-vue2/

COPY ./lerna.json /e2e/lerna.json
COPY ./package*.json /e2e/

RUN npm install --unsafe-perm

# copy project (including tests)
COPY . /e2e/

RUN cd ./packages/csc-ui && npx playwright install

# Run playwright test
CMD cd packages/csc-ui && npx playwright test --reporter=list
