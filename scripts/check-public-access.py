"""Read-only checks: do not read customer fields, create users or submit enquiries."""
import json,re,urllib.request,urllib.error
from pathlib import Path
config=(Path(__file__).resolve().parents[1]/'dist/supabase-config.js').read_text()
base=re.search(r"url: '([^']+)'",config)[1]
key=re.search(r"publishableKey: '([^']+)'",config)[1]
def get(path):
 try:
  with urllib.request.urlopen(urllib.request.Request(base+path,headers={'apikey':key}),timeout=20) as response:
   return response.status,json.load(response)
 except urllib.error.HTTPError as error: return error.code,None
for table,column in [('qixarc_enquiries','id'),('qixarc_admins','user_id')]:
 status,_=get('/rest/v1/'+table+'?select='+column+'&limit=0')
 assert status in (401,403),(table,status)
 print('PASS: anonymous access denied for',table)
status,data=get('/rest/v1/qixarc_content?status=eq.draft&select=id&limit=1')
assert status==200 and data==[],('drafts',status)
print('PASS: drafts are hidden from anonymous visitors')
status,data=get('/rest/v1/qixarc_content?status=eq.published&select=slug&limit=1')
assert status==200 and data,('published',status)
print('PASS: published content remains readable')
status,_=get('/auth/v1/user')
assert status in (401,403),('unauthenticated user',status)
print('PASS: user endpoint requires an authenticated session')
