from pathlib import Path
from PIL import Image, ImageOps
import re, json, urllib.request, urllib.error, concurrent.futures
root=Path('dist')
results=[]
for name in ['cafe','commerce','web']:
    source=root/'assets'/f'{name}.jpg'
    image=Image.open(source)
    output=root/'assets'/f'{name}.webp'
    image.save(output,'WEBP',quality=78,method=6)
    results.append({'image':name,'before':source.stat().st_size,'after':output.stat().st_size})
logo=Image.open(root/'assets/qixarc-logo.webp').convert('RGBA')
for size,name in [(32,'favicon-32.png'),(180,'apple-touch-icon.png'),(128,'logo-nav.webp')]:
    icon=ImageOps.contain(logo,(size,size),Image.Resampling.LANCZOS)
    square=Image.new('RGBA',(size,size),(0,0,0,0)); square.alpha_composite(icon,((size-icon.width)//2,(size-icon.height)//2))
    square.save(root/'assets'/name, optimize=True)
square=ImageOps.pad(logo,(64,64),color=(0,0,0,0))
square.save(root/'favicon.ico',sizes=[(16,16),(32,32),(48,48),(64,64)])
print(json.dumps({'compression':results}))
urls=sorted(set(re.findall(r'href="(https?[^\"]+)"',(root/'index.html').read_text(encoding='utf-8'))))
def check(url):
    if 'fonts.' in url: return None
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(req,timeout=15) as r:
            body=r.read(300000).decode('utf-8',errors='ignore')
            title=re.search(r'<title[^>]*>(.*?)</title>',body,re.S|re.I)
            return {'url':url,'status':r.status,'title':title.group(1)[:180] if title else ''}
    except Exception as e: return {'url':url,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    checks=[r for r in pool.map(check,urls) if r]
Path('scripts/link-audit.json').write_text(json.dumps(checks,indent=2))
print(json.dumps(checks))
