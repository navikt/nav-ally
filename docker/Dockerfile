FROM alpine:latest

# Installs latest Chromium package.
RUN apk update && apk upgrade \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories \
    && apk add --no-cache \
    chromium@edge \
    harfbuzz@edge \
    nss@edge \
    chromium-chromedriver \
    make gcc g++ python git bash nodejs nodejs-npm \
    && rm -rf /var/lib/apt/lists/* \
    /var/cache/apk/* \
    /usr/share/man \
    /tmp/*

ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/
ENV chromedriver /usr/bin/chromedriver
ENV webdriver.chrome.driver /usr/bin/chromedriver
ENV PATH $webdriver.chrome.driver:$PATH

# Validator app
COPY run.sh /
RUN git clone https://github.com/navikt/nav-ally && \
    mv run.sh nav-ally/ && \
    chmod +x /nav-ally/run.sh && \
    cd nav-ally && npm install
WORKDIR /nav-ally
ENTRYPOINT ["/nav-ally/run.sh"]
CMD []
