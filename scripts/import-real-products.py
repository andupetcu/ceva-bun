#!/usr/bin/env python3
"""Generate real ceva-bun seed data from 2Performant CSV feeds."""
import csv, json, random, os, sys

DATA_DIR = os.path.expanduser("~/.openclaw/workspace/inpromotie/data")

def read_feed(csv_file, max_rows=50000):
    filepath = os.path.join(DATA_DIR, csv_file)
    products = []
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if i >= max_rows: break
            title = row.get('title','').strip('"')
            price_s = row.get('price','0').strip('"')
            old_s = row.get('old_price','').strip('"')
            aff = row.get('aff_code','').strip('"')
            img = row.get('image_urls','').strip('"').split(',')[0].strip()
            active = row.get('product_active','1').strip('"')
            cat = row.get('category','').strip('"').lower()
            brand = row.get('brand','').strip('"')
            if active == '0' or not aff or not img: continue
            if not img.startswith('http'): continue
            try: price = float(price_s.replace(',','.'))
            except: continue
            if price < 10 or price > 10000: continue
            old_price = None
            if old_s:
                try: old_price = float(old_s.replace(',','.'))
                except: pass
            disc = ((old_price - price) / old_price * 100) if old_price and old_price > price else 0
            products.append({
                'title': title, 'price': price, 'old_price': old_price, 'disc': disc,
                'aff': aff, 'img': img, 'cat': cat, 'brand': brand
            })
    return products

def kw_filter(products, include, exclude=None):
    result = []
    for p in products:
        text = (p['title'] + ' ' + p['cat'] + ' ' + p['brand']).lower()
        if any(k in text for k in include):
            if exclude and any(k in text for k in exclude):
                continue
            result.append(p)
    return result

def pick(products, n=15):
    """Pick n products: diverse brands, prefer discounted."""
    random.shuffle(products)
    products.sort(key=lambda p: -p['disc'])
    seen_brands = set()
    picked = []
    for p in products:
        brand = p['brand'].lower()[:20]
        if brand in seen_brands and len(picked) < n * 2:
            continue
        seen_brands.add(brand)
        picked.append(p)
        if len(picked) >= n:
            break
    return picked

def to_seed(p, category, store):
    desc = f"{p['brand']}" if p['brand'] else p['cat'][:50]
    return {
        "title": p['title'][:100],
        "description": desc,
        "category": category,
        "priceCents": int(p['price'] * 100),
        "oldPriceCents": int(p['old_price'] * 100) if p['old_price'] else None,
        "currency": "RON",
        "imageUrl": p['img'],
        "affiliateUrl": p['aff'],
        "sourceName": store,
        "sourceType": "affiliate",
        "available": True,
        "rating": round(random.uniform(4.0, 4.9), 1),
        "tags": [category, store.replace('.ro','')]
    }

all_products = []

# 1. BAGAT IN GURA — drinks + food
print("Loading bagat_in_gura...", file=sys.stderr)
tuica = read_feed('774944ce6.csv', 50000)
drinks = kw_filter(tuica, 
    ['tuica','palinca','vin ','vinuri','whisky','vodka','rom ','gin ','lichior','bere','cafea','ceai','sampanie','prosecco','miere','sirop','cognac','coniac','tarie','rachiu','grappa','brandy'],
    exclude=['dulap','scaun','masa','pat ','canapea','birou','raft','comoda','fotoliu','masuta','chiuveta','baterie','robinet','cada'])
for p in pick(drinks, 15):
    all_products.append(to_seed(p, 'bagat_in_gura', 'fabricadetuica.ro'))

vitamix = read_feed('712b65f5e.csv', 50000)
food = kw_filter(vitamix,
    ['ceai','cafea','miere','ciocolata','cacao','matcha','granola','protein','unt arahide','tahini','dulceata','fructe uscate','nuci','seminte','superfood','cocos','migdale','alune'],
    exclude=['dulap','scaun','masa','pat ','birou','raft','chiuveta','sampon','crema','gel de dus'])
for p in pick(food, 5):
    all_products.append(to_seed(p, 'bagat_in_gura', 'vitamix.ro'))

# 2. DE PURTAT — fashion
print("Loading de_purtat...", file=sys.stderr)
fashion = read_feed('ffa1c7a34.csv', 50000)
clothes = kw_filter(fashion,
    ['sneaker','adidas','nike','puma','geaca','tricou','pantofi','ghete','bluza','jeans','pantalon','ceas','rucsac','ochelari','esarfa','sapca','hanorac','palton','cizme','tenisi','jordan','new balance','vans','converse','sandale','rochie','camasa','sacou','portofel','curea','bratara','colier','cercei'],
    exclude=['telefon','laptop','tableta','imprimanta','frigider'])
for p in pick(clothes, 15):
    all_products.append(to_seed(p, 'de_purtat', 'originals.ro'))

# 3. DE CITIT — books
print("Loading de_citit...", file=sys.stderr)
books = read_feed('f8ffadcf3.csv', 50000)
good_books = [p for p in books if 15 < p['price'] < 200 and len(p['title']) > 10]
# Prefer fiction + bestsellers
fiction = kw_filter(good_books, ['roman','povesti','aventura','mister','thriller','fantasy','science fiction','dragoste','clasic','colectie','harry potter','game of thrones','dune','sapiens','atomic','tolkien','dostoievski','kafka','murakami','marquez','hemingway'])
nonfiction = kw_filter(good_books, ['dezvoltare','psihologie','afaceri','istorie','filosofie','stiinta','biografie','management','marketing','programare','investitii','meditatie','mindfulness'])
for p in pick(fiction, 10):
    all_products.append(to_seed(p, 'de_citit', 'libris.ro'))
for p in pick(nonfiction, 5):
    all_products.append(to_seed(p, 'de_citit', 'libris.ro'))

# 4. PENTRU COPII — kids
print("Loading pentru_copii...", file=sys.stderr)
ookee = read_feed('0a8bb918c.csv', 50000)
kids = kw_filter(ookee,
    ['copii','jucari','lego','puzzle','joc ','carte copii','plush','papusa','masinuta','educativ','bicicleta copii','trotineta','triciclu','robot','dinozaur','plus ','disney','paw patrol','pokemon','minnie','mickey','frozen','spider','avengers','barbie','hot wheels'],
    exclude=['adulti','18+'])
for p in pick(kids, 15):
    all_products.append(to_seed(p, 'pentru_copii', 'ookee.ro'))

# 5. 18+ — adult + beauty
print("Loading 18plus...", file=sys.stderr)
adult = read_feed('689818a2f.csv', 50000)
adult_curated = kw_filter(adult,
    ['lenjerie','costum','joc cuplu','masaj','lumanare','set cadou','accesoriu','parfum'],
    exclude=['vibrator','dildo','anal','penis','vagin'])
for p in pick(adult_curated, 5):
    all_products.append(to_seed(p, '18plus', 'sexshop.ro'))

esteto = read_feed('7680f01dc.csv', 50000)
beauty = kw_filter(esteto,
    ['parfum','set cadou','aromaterapie','lumanare parfum','ulei esential','crema corp','spa','masaj','apa de parfum','apa de toaleta','trusa machiaj'],
    exclude=['aspirator','electrocasnice','telefon'])
for p in pick(beauty, 10):
    all_products.append(to_seed(p, '18plus', 'esteto.ro'))

# 6. DE FACUT — keep manual (no feed for activities)
manual_facut = [
    {"title":"Escape Room The Heist la Captive","description":"Jefuiește seiful într-o oră. 2-6 jucători.","category":"de_facut","priceCents":20000,"oldPriceCents":25000,"priceSuffix":"lei/grup","currency":"RON","imageUrl":"https://picsum.photos/seed/escape1/600/400","productUrl":"https://captive.ro","affiliateUrl":None,"sourceName":"Captive","sourceType":"manual","available":True,"rating":4.8,"tags":["de_facut","escape-room","bucuresti"]},
    {"title":"Escape Room Laboratorul Secret","description":"Rezolvă puzzle-uri științifice. 2-5 jucători.","category":"de_facut","priceCents":18000,"oldPriceCents":22000,"priceSuffix":"lei/grup","currency":"RON","imageUrl":"https://picsum.photos/seed/escape2/600/400","productUrl":"https://escapecentral.ro","affiliateUrl":None,"sourceName":"Escape Central","sourceType":"manual","available":True,"rating":4.7,"tags":["de_facut","escape-room","bucuresti"]},
    {"title":"Spectacol la Teatrul Național","description":"Experiență teatrală de top","category":"de_facut","priceCents":7500,"oldPriceCents":9000,"priceSuffix":"lei/persoană","currency":"RON","imageUrl":"https://picsum.photos/seed/theater/600/400","productUrl":"https://www.tnb.ro","affiliateUrl":None,"sourceName":"TNB","sourceType":"manual","available":True,"rating":4.6,"tags":["de_facut","teatru","bucuresti"]},
    {"title":"Via Ferrata la Cheile Grădiștei","description":"Cățărare pe traseu via ferrata cu echipament inclus","category":"de_facut","priceCents":15000,"oldPriceCents":18000,"priceSuffix":"lei/persoană","currency":"RON","imageUrl":"https://picsum.photos/seed/ferrata/600/400","productUrl":"https://climbagain.ro","affiliateUrl":None,"sourceName":"Climb Again","sourceType":"manual","available":True,"rating":4.9,"tags":["de_facut","outdoor","brasov"]},
    {"title":"Operă la ONB","description":"Seară la Opera Națională București","category":"de_facut","priceCents":10000,"oldPriceCents":12000,"priceSuffix":"lei/persoană","currency":"RON","imageUrl":"https://picsum.photos/seed/opera/600/400","productUrl":"https://operanb.ro","affiliateUrl":None,"sourceName":"Opera Națională","sourceType":"manual","available":True,"rating":4.7,"tags":["de_facut","opera","bucuresti"]},
    {"title":"Drumeție Piatra Craiului cu ghid","description":"Tur de o zi cu ghid montan autorizat","category":"de_facut","priceCents":20000,"oldPriceCents":25000,"priceSuffix":"lei/persoană","currency":"RON","imageUrl":"https://picsum.photos/seed/hike/600/400","productUrl":"https://mountaintrip.ro","affiliateUrl":None,"sourceName":"Mountain Trip","sourceType":"manual","available":True,"rating":4.8,"tags":["de_facut","hiking","brasov"]},
    {"title":"Workshop ceramică","description":"Creează propria ceașcă într-un atelier ghidat","category":"de_facut","priceCents":18000,"oldPriceCents":22000,"priceSuffix":"lei/persoană","currency":"RON","imageUrl":"https://picsum.photos/seed/ceramic/600/400","affiliateUrl":None,"sourceName":"Atelier Ceramica","sourceType":"manual","available":True,"rating":4.6,"tags":["de_facut","workshop","bucuresti"]},
    {"title":"Degustare de vin cu somelier","description":"Degustă 6 vinuri premium cu explicații de expert","category":"de_facut","priceCents":25000,"oldPriceCents":30000,"priceSuffix":"lei/persoană","currency":"RON","imageUrl":"https://picsum.photos/seed/winetasting/600/400","affiliateUrl":None,"sourceName":"Vinoteca","sourceType":"manual","available":True,"rating":4.7,"tags":["de_facut","tasting","bucuresti"]},
]
all_products.extend(manual_facut)

print(f"\nTotal: {len(all_products)} products", file=sys.stderr)
from collections import Counter
cats = Counter(p['category'] for p in all_products)
for k,v in sorted(cats.items()):
    has_aff = sum(1 for p in all_products if p['category']==k and p.get('affiliateUrl'))
    print(f"  {k}: {v} ({has_aff} with affiliate URL)", file=sys.stderr)

print(json.dumps(all_products, indent=2, ensure_ascii=False))
