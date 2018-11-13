FROM docker.adeo.no:5000/pus/toolbox

# Driver binaries
ADD driver/chromedriver /usr/bin/chromedriver
ADD driver/geckodriver /usr/bin/geckodriver

# ChromeDriver
ENV webdriver.chrome.driver /usr/bin/chromedriver
ENV PATH $webdriver.chrome.driver:$PATH
ENV CHROME_BINARY /usr/bin/google-chrome
RUN chmod +x /usr/bin/chromedriver

# GeckoDriver
ENV webdriver.gecko.driver /usr/bin/geckodriver
ENV FIREFOX_BINARY /usr/bin/firefox
ENV PATH $webdriver.gecko.driver:$PATH
RUN chmod +x /usr/bin/geckodriver

# Chrome and Firefox browser deps
RUN apt-get update && apt-get -qqy --no-install-recommends install -y \
libxi6 \
libgconf-2-4 \
xvfb \
fonts-liberation \
libappindicator3-1 \
libgtk-3-0 \
libxss1 \
xdg-utils \
bzip2 \
gconf-service

# Chrome browser binary
RUN wget --no-check-certificate https://dl-ssl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome-stable_current_amd64.deb

# Firefox
ARG FIREFOX_VERSION=60.0.2
RUN apt-get -qqy --no-install-recommends install firefox && rm -rf /var/lib/apt/lists/* /var/cache/apt/*
RUN wget --no-check-certificate --no-verbose -O /tmp/firefox.tar.bz2 https://download-installer.cdn.mozilla.net/pub/firefox/releases/$FIREFOX_VERSION/linux-x86_64/nb-NO/firefox-$FIREFOX_VERSION.tar.bz2
RUN apt-get -y purge firefox \
  && rm -rf /opt/firefox \
  && tar -C /opt -xjf /tmp/firefox.tar.bz2 \
  && rm /tmp/firefox.tar.bz2 \
  && mv /opt/firefox /opt/firefox-$FIREFOX_VERSION \
  && ln -fs /opt/firefox-$FIREFOX_VERSION/firefox /usr/bin/firefox

# Validator app
ADD / /uu-validator
RUN chmod +x /uu-validator/run.sh
WORKDIR /uu-validator
RUN npm install

CMD /uu-validator/run.sh
