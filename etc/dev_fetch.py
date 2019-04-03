import sys
import requests

resp = requests.get('http://localhost/' + sys.argv[1])
print(resp.status_code)

print(resp.text)
