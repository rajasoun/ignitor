import cachetclient.cachet as cachet
import json

ENDPOINT = 'http://hostlocal.io:8787/api/v1'
API_TOKEN = '0yS1fNAqUBI0F3yFHL71'

# /ping
ping = cachet.Ping(endpoint=ENDPOINT)
print(ping.get())

# /version
version = cachet.Version(endpoint=ENDPOINT)
print(version.get())

##:ToDO: Fix : Component Creation To Be Idempotent & Iterate Through Collection
# /components
components = cachet.Components(endpoint=ENDPOINT, api_token=API_TOKEN)
portainer = json.loads(components.post(name='Portainer',
                                       status=1,
                                       link='http://dev.xkit.co:9000/portainer',
                                       description='Portainer'))

cachet = json.loads(components.post(name='cachet',
                                       status=1,
                                       link='http://dev.xkit.co:8787/',
                                       description='cachet'))

print(components.get())



