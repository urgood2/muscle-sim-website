"""Validate a fresh Hugo artifact: python scripts/check_site.py BUILD_DIRECTORY."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import json
import sys
import xml.etree.ElementTree as ET

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.h1=0; self.main=0; self.canonical=[]; self.images=[]; self.links=[]; self.title=''; self.in_title=False
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if tag=='h1': self.h1+=1
        if tag=='main': self.main+=1
        if tag=='title': self.in_title=True
        if tag=='link' and attrs.get('rel')=='canonical': self.canonical.append(attrs.get('href'))
        if tag=='img': self.images.append(attrs.get('src',''))
        if tag=='a': self.links.append(attrs.get('href',''))
    def handle_endtag(self, tag):
        if tag=='title': self.in_title=False
    def handle_data(self, data):
        if self.in_title: self.title+=data

root=Path(sys.argv[1]); failures=[]; broken=[]
urls=ET.parse(root/'sitemap.xml').getroot()
for entry in urls:
    url=entry.find('{*}loc').text
    path=unquote(urlparse(url).path).strip('/')
    file=root/path/'index.html'
    page=Page(file.read_text())
    if page.h1!=1 or page.main!=1 or len(page.canonical)!=1 or not page.title.strip() or '| 0001' in page.title:
        failures.append((url,'structure',page.h1,page.main,page.title))
    for value in page.images+page.links:
        parsed=urlparse(value)
        if parsed.scheme or parsed.netloc or not value or value.startswith('#'): continue
        resolved=(root/unquote(parsed.path).lstrip('/')) if value.startswith('/') else (file.parent/unquote(parsed.path))
        if not resolved.exists(): broken.append((url,value))
for route in ['demo','demo-landing-page-spec']:
    assert not (root/route/'index.html').exists(),route
feed=ET.parse(root/'index.xml').getroot()
assert all(i.findtext('title') for i in feed.findall('./channel/item'))
assert all('/post/' in i.findtext('link') for i in feed.findall('./channel/item'))
home=Page((root/'index.html').read_text())
assert len(home.images)<=20
assert (root/'page/2/index.html').exists()
print(json.dumps({'pages':len(urls),'failures':failures,'broken_local_references':sorted(set(broken))},indent=2))
assert not failures
assert not broken
