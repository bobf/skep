import traceback
import json
import urllib.parse
import urllib.request
from urllib.request import Request

class Publisher:
    def __init__(self, app_url, log):
        self.app_url = app_url
        self.log = log
        self.url = urllib.parse.urljoin(self.app_url, 'chart_response')
        self.headers = { 'Content-Type': 'application/json' }

    def publish_error(self, sid, meta):
        meta['error'] = True
        request = Request(
            self.url,
            data=json.dumps({ 'sid': sid, 'meta': meta }).encode('utf8'),
            headers=self.headers
        )
        try:
            response = urllib.request.urlopen(request)
        except Exception as e:
            traceback.print_exc()
            raise
        self.log.debug('Published error: %s [%s] %s' % (self.url, response.getcode(), response.read()))

    def publish(self, period, chart_data, sid, meta):
        request = self.request(period, chart_data, sid, meta)

        try:
            response = urllib.request.urlopen(request)
        except urllib.error.URLError as e:
            self.log.warning(
                'Could not publish chart: %s (%s)' % (self.url, e)
            )
        else:
            self.log.debug(
                'Published chart: %s [%s] %s' % (
                    self.url, response.getcode(), response.read()
                )
            )

    def request(self, period, chart_data, sid, meta):
        params = {
            'sid': sid,
            'period': period,
            'chart': chart_data,
            'meta': meta
        }

        return Request(
            self.url,
            data=json.dumps(params).encode('utf8'),
            headers=self.headers
        )

