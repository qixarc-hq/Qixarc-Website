"""Verify public access boundaries without reading or printing customer data."""
import json, urllib.request, urllib.error, uuid

URL = 'https://iosmotdjsrwuktpzrxvu.supabase.co/rest/v1/'
KEY = 'sb_publishable_328z-q2VEy4Zg8Bqb3fhrw_6G2-MS02'

def request(path, method='GET', body=None):
    req = urllib.request.Request(URL+path, method=method, headers={'apikey':KEY,'Content-Type':'application/json'}, data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(req) as response:
            raw=response.read(); return response.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as error:
        return error.code, None

assert request('qixarc_enquiries?select=id')[0] in (401,403)
assert request('qixarc_admins?select=user_id')[0] in (401,403)
code, rows = request('qixarc_content?status=eq.draft&select=id')
assert code==200 and rows==[]
code, rows = request('qixarc_content?status=eq.published&select=slug')
assert code==200 and len(rows)>=4
assert request('qixarc_content','POST',dict(kind='blog',slug='unauthorized-test',title='Denied',summary='',body='Denied',status='published'))[0] in (401,403)
identifier=str(uuid.uuid4())
assert request('qixarc_enquiries','POST',dict(id=identifier,name='QIXARC verification test',email='qa@example.com',service='Integration test',message='Temporary integration test; safe to remove.'))[0]==201
print('PASS: public enquiry insert; private enquiries/admins; draft isolation; public content; unauthorized publishing denied.')
print('TEST_ENQUIRY_ID='+identifier)
