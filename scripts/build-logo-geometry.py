from PIL import Image, ImageFilter
from pathlib import Path
import json, math
im=Image.open('dist/assets/qixarc-logo.webp').convert('RGBA')
im.thumbnail((620,620))
w,h=im.size
alpha=im.getchannel('A').filter(ImageFilter.GaussianBlur(1.6)); mask=lambda x,y: 0<=x<w and 0<=y<h and alpha.getpixel((x,y))>=210
edges={}
def edge(a,b): edges.setdefault(a,[]).append(b)
for y in range(h):
 for x in range(w):
  if not mask(x,y): continue
  if not mask(x,y-1): edge((x,y),(x+1,y))
  if not mask(x+1,y): edge((x+1,y),(x+1,y+1))
  if not mask(x,y+1): edge((x+1,y+1),(x,y+1))
  if not mask(x-1,y): edge((x,y+1),(x,y))
loops=[]
while edges:
 start=next(iter(edges)); p=start; loop=[]
 while True:
  loop.append(p); targets=edges[p]; q=targets.pop()
  if not targets: del edges[p]
  p=q
  if p==start: break
 loops.append(loop)
def area(p): return sum(p[i][0]*p[(i+1)%len(p)][1]-p[(i+1)%len(p)][0]*p[i][1] for i in range(len(p)))/2
def simplify(p):
 if len(p)<3:return p
 a,b=p[0],p[-1]; dx,dy=b[0]-a[0],b[1]-a[1]; den=math.hypot(dx,dy)
 ds=[abs(dy*q[0]-dx*q[1]+b[0]*a[1]-b[1]*a[0])/den if den else math.dist(a,q) for q in p]
 i=max(range(len(ds)),key=ds.__getitem__)
 return simplify(p[:i+1])[:-1]+simplify(p[i:]) if ds[i]>2.2 else [a,b]
def inside(p,poly):
 x,y=p; found=False
 for i,a in enumerate(poly):
  b=poly[(i+1)%len(poly)]
  if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:found=not found
 return found
outer=[p for p in loops if area(p)>140]; holes=[p for p in loops if area(p)<-140]
def coords(p):return [[round((x/w-.5)*3.7,4),round((.5-y/h)*3.7,4)] for x,y in simplify(p+[p[0]])[:-1]]
shapes=[{'outline':coords(p),'holes':[coords(hole) for hole in holes if inside(hole[0],p)]} for p in outer]
Path('dist/assets/logo-shapes.js').write_text('export default '+json.dumps(shapes,separators=(',',':'))+';\n')
print('Logo shapes:',len(shapes),'vertices:',sum(len(s['outline']) for s in shapes))

