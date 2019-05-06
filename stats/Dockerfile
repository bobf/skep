FROM alpine:3.9.3
RUN apk --update add python3 git wget \
 && wget 'https://bootstrap.pypa.io/get-pip.py' -O get-pip.py \
 && python3 get-pip.py \
 && git clone https://github.com/bobf/linux-metrics.git /linux-metrics \
 && cd /linux-metrics && python3 setup.py install
COPY stats.py /stats.py
CMD python3 /stats.py
