import json
import urllib.parse
import urllib.request
from urllib.request import Request

class Publisher:
    def __init__(self, app_url, auth, log):
        self.app_url = app_url
        self.auth = auth
        self.log = log

    def publish(self, period, data, sid, token):
        url = urllib.parse.urljoin(self.app_url, 'chart_response')
        request = self.request(url, period, data, sid, token)

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

    def request(self, url, period, data, sid, token):
        headers = { 'Content-Type': 'application/json', **self.auth }
        params = {
            'sid': sid,
            'requestID': token,
            'period': period,
            'chart': data
        }

        print("PUBLISH", params)
        return Request(
            url,
            data=json.dumps(params).encode('utf8'),
            headers=headers
        )

