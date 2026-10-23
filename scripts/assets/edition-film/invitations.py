"""Compose invitation formats from the existing, approved public product captures."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'public/share/one-more-round'
FONT=ROOT/'public/fonts/bricolage-report-700.ttf'
REGULAR=ROOT/'public/fonts/bricolage-report-400.ttf'
INK='#0a1110'; PAPER='#f4f2e8'; ACID='#d6fb42'
shots=[ROOT/'public/share/protocol-11/table-layout-production-1366x768.png',ROOT/'public/share/shoalshot/screenshot/after-production-action-1728x918.png']
def make(fmt,w,h):
 im=Image.new('RGB',(w,h),INK); d=ImageDraw.Draw(im)
 def text(x,y,s,size=50,fill=PAPER,bold=True):d.text((x,y),s,font=ImageFont.truetype(str(FONT if bold else REGULAR),size),fill=fill,spacing=4)
 def pic(path,box):
  src=Image.open(path).convert('RGB'); view=ImageOps.contain(src,(box[2],box[3])); x=box[0]+(box[2]-view.width)//2;y=box[1]+(box[3]-view.height)//2;im.paste(view,(x,y))
 if fmt=='landscape':
  text(75,55,'WOODHOUSE',28,ACID);text(75,170,'One more',157);text(75,325,'round.',157,ACID)
  text(80,545,'A table. A shot.\nA board. A squad.',47,bold=False)
  pic(shots[0],(1000,80,830,440));pic(shots[1],(1075,490,770,430))
  d.line((80,915,1840,915),fill=ACID,width=2);text(80,947,'Play · Listen · Build',34);text(1090,947,'woodhouse.loftwah.com',35,ACID)
 elif fmt=='square':
  text(58,48,'WOODHOUSE',27,ACID);text(55,125,'One more',130);text(55,250,'round.',130,ACID)
  pic(shots[0],(58,455,620,350));pic(shots[1],(550,620,590,335))
  text(60,845,'Play. Listen.\nTry a composition.',40,bold=False)
  d.line((60,1045,1140,1045),fill=ACID,width=2);text(60,1090,'woodhouse.loftwah.com',42,ACID)
 else:
  text(60,75,'WOODHOUSE',32,ACID);text(55,210,'One more',146);text(55,355,'round.',146,ACID)
  text(65,585,'A table. A shot.\nA board. A squad.',53,bold=False)
  pic(shots[0],(50,830,880,500));pic(shots[1],(140,1200,880,480))
  d.line((65,1745,1015,1745),fill=ACID,width=2);text(65,1785,'woodhouse.loftwah.com',42,ACID)
 im.save(OUT/f'invitation-{fmt}.jpg',quality=93,subsampling=0)
for args in [('landscape',1920,1080),('square',1200,1200),('portrait',1080,1920)]:make(*args)
