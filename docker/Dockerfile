FROM alpine:latest

# Installs latest Chromium package.
RUN apk update && apk upgrade \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories \
    && apk add --no-cache \
    chromium@edge \
    nss@edge \
    chromium-chromedriver \
    make gcc g++ python git bash nodejs nodejs-npm \
    && rm -rf /var/lib/apt/lists/* \
    /var/cache/apk/* \
    /usr/share/man \
    /tmp/*

ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/

ENV webdriver.chrome.driver /usr/bin/chromedriver
ENV PATH $webdriver.chrome.driver:$PATH
ENV CHROME_BINARY $CHROME_BIN
RUN chmod +x /usr/bin/chromedriver

# Validator app
COPY run.sh /
RUN git clone https://github.com/navikt/nav-ally && \
    mv run.sh nav-ally/ && \
    chmod +x /nav-ally/run.sh && \
    cd nav-ally && npm install && \
    rm ./node_modules/chromedriver/lib/chromedriver/chromedriver && \
    cp /usr/bin/chromedriver ./node_modules/chromedriver/lib/chromedriver/chromedriver && \
    chmod +x ./node_modules/chromedriver/lib/chromedriver/chromedriver
WORKDIR /nav-ally
ENTRYPOINT ["/nav-ally/run.sh"]
CMD []
