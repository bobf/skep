import json
import urllib.parse
import urllib.request
from urllib.request import Request

class Publisher:
    def __init__(self, app_url, log):
        self.app_url = app_url
        self.log = log

    def publish(self, period, chart_data, sid, meta):
        url = urllib.parse.urljoin(self.app_url, 'chart_response')
        request = self.request(url, period, chart_data, sid, meta)

        try:
            response = urllib.request.urlopen(request)
        except urllib.error.URLError as e:
            self.log.warning(
                'Could not publish chart: %s (%s)' % (url, e)
            )
        else:
            self.log.debug(
                'Published chart: %s [%s] %s' % (
                    url, response.getcode(), response.read()
                )
            )

    def request(self, url, period, chart_data, sid, meta):
        headers = { 'Content-Type': 'application/json' }
        params = {
            'sid': sid,
            'period': period,
            'chart': chart_data,
            'meta': meta
        }

        return Request(
            url,
            data=json.dumps(params).encode('utf8'),
            headers=headers
        )

