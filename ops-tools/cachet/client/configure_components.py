import cachetclient.cachet as cachet
import json

ENDPOINT = 'http://hostlocal.io:8787/api/v1'
API_TOKEN = 'SmP29MjYTxLDh3ZwEhgy'

# /ping
ping = cachet.Ping(endpoint=ENDPOINT)
print(ping.get())

# /version
version = cachet.Version(endpoint=ENDPOINT)
print(version.get())

# /components
components = cachet.Components(endpoint=ENDPOINT, api_token=API_TOKEN)
new_component = json.loads(components.post(name='Portainer',
                                           status=1,
                                           link='http://dev.xkit.co:9000/',
                                           description='Portainer'))
components.put(id=new_component['data']['id'], description='Updated component')
print(components.get(id=new_component['data']['id']))
