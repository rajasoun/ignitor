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

# /components
components = cachet.Components(endpoint=ENDPOINT, api_token=API_TOKEN)
new_component = json.loads(components.post(name='Test component',
                                           status=1,
                                           description='Test component'))
print(components.get())
components.put(id=new_component['data']['id'], description='Updated component')
print(components.get(id=new_component['data']['id']))
components.delete(id=new_component['data']['id'])

# /components/groups
groups = cachet.Groups(endpoint=ENDPOINT, api_token=API_TOKEN)
new_group = json.loads(groups.post(name='Test group'))
print(groups.get())
groups.put(id=new_group['data']['id'], name='Updated group')
print(groups.get(id=new_group['data']['id']))
groups.delete(new_group['data']['id'])

# /incidents
incidents = cachet.Incidents(endpoint=ENDPOINT, api_token=API_TOKEN)
new_incident = json.loads(incidents.post(name='Test incident',
                                         message='Houston, we have a problem.',
                                         status=1))
print(incidents.get())
incidents.put(id=new_incident['data']['id'],
              message="There's another problem, Houston.")
print(incidents.get(id=new_incident['data']['id']))
incidents.delete(id=new_incident['data']['id'])

# /metrics
# /metrics/points
metrics = cachet.Metrics(endpoint=ENDPOINT, api_token=API_TOKEN)
new_metric = json.loads(metrics.post(name='Test metric',
                                     suffix='Numbers per hour',
                                     description='How many numbers per hour',
                                     default_value=0))
print(metrics.get())
print(metrics.get(id=new_metric['data']['id']))

points = cachet.Points(endpoint=ENDPOINT, api_token=API_TOKEN)
new_point = json.loads(points.post(id=new_metric['data']['id'], value=5))
print(points.get(metric_id=new_metric['data']['id']))

points.delete(metric_id=new_metric['data']['id'],
              point_id=new_point['data']['id'])
metrics.delete(id=new_metric['data']['id'])

# /subscribers
subscribers = cachet.Subscribers(endpoint=ENDPOINT, api_token=API_TOKEN)
new_subscriber = json.loads(subscribers.post(email='test@test.org'))
subscribers.delete(id=new_subscriber['data']['id'])
