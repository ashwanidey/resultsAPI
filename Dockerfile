# syntax = docker/dockerfile:1

FROM node:20.3.0-slim as base

# Start with a plain Node image.

+ # Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
+ # Note: this installs the necessary libs to make the bundled version of Chrome that Puppeteer
+ # installs, work.
+ RUN apt-get update \
+     && apt-get install -y wget gnupg \
+     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
+     && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
+     && apt-get update \
+     && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 \
+       --no-install-recommends \
+     && rm -rf /var/lib/apt/lists/*

FROM base as build

# Install dependencies & build application code.

FROM base

# Copy the application code from `build` and start it up.
COPY --from=build /app /app
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

EXPOSE 3000
CMD [ "npm", "run", "start" ]