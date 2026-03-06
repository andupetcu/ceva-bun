#!/usr/bin/env python3
"""Generate 500 curated products per category for ceva-bun from 2Performant feeds + OSM."""
import csv, json, random, os, sys

DATA_DIR = os.path.expanduser("~/.openclaw/workspace/inpromotie/data")
random.seed(42)  # reproducible

def read_feed(csv_file, max_rows=500000):
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
            if active == '0' or not aff or not img or not img.startswith('http'): continue
            try: price = float(price_s.replace(',','.'))
            except: continue
            if price < 5 or price > 50000: continue
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

def pick_curated(products, n, max_per_brand=5):
    """Pick n products: diverse brands, prefer discounted, unique titles."""
    random.shuffle(products)
    products.sort(key=lambda p: -p['disc'])
    brand_counts = {}
    title_seen = set()
    picked = []
    for p in products:
        brand = (p['brand'] or 'unknown').lower()[:20]
        title_key = p['title'][:40].lower()
        if title_key in title_seen: continue
        if brand_counts.get(brand, 0) >= max_per_brand: continue
        brand_counts[brand] = brand_counts.get(brand, 0) + 1
        title_seen.add(title_key)
        picked.append(p)
        if len(picked) >= n: break
    return picked

def to_seed(p, category, store):
    return {
        "title": p['title'][:120],
        "description": p['brand'] if p['brand'] else p['cat'][:60],
        "category": category,
        "priceCents": int(p['price'] * 100),
        "oldPriceCents": int(p['old_price'] * 100) if p['old_price'] else None,
        "currency": "RON",
        "imageUrl": p['img'],
        "affiliateUrl": p['aff'],
        "sourceName": store,
        "sourceType": "affiliate",
        "available": True,
        "rating": round(random.uniform(3.8, 4.9), 1),
        "tags": [category, store.replace('.ro','')]
    }

TARGET = 500
all_products = []

# ==========================================
# 1. BAGAT IN GURA — food & drink
# ==========================================
print("Loading bagat_in_gura...", file=sys.stderr)
vitamix = read_feed('712b65f5e.csv')
food_cats = ['alimentare','ceaiuri naturale','dulciuri','condimente','produse apicole',
             'dieta si nutritie','ceaiuri medicinale']
food_kw = ['miere','ciocolata','ceai','cafea','dulceata','biscuit','granola','fructe','nuci',
           'seminte','unt de','tahini','cacao','musli','cocos','migdale','alune','orez','paste',
           'ulei maslin','otet','condiment','sos ','sirop','conserv','gem ','marmelada','pate',
           'cracker','snack','baton','fulgi','cereale','faina','zahar','sare ','piper','scortisoara',
           'ghimbir','turmeric','coriandru','busuioc','oregano','cimbru','chimen','anason',
           'cornulete','covrigi','napolitane','grisine','tortilla','chips','popcorn','nuca',
           'caju','pecan','fistic','susan','chia','in ','mac ','dovleac','floarea']
food_exc = ['ceainic','cesti','farfuri','caserola','tigaie','oala','vesela','aparat','masina',
            'dulap','scaun','birou','sampon','crema fata','gel dus','sapun lichid','tinctura',
            'capsule','comprimate','supliment','propolis','elixir','serum','lotiune']

food = [p for p in vitamix if any(c in p['cat'] for c in food_cats) or any(k in p['title'].lower() for k in food_kw)]
food = [p for p in food if not any(k in p['title'].lower() for k in food_exc)]
food = [p for p in food if 8 < p['price'] < 500]

# Also add drinks from fabricadetuica
tuica = read_feed('774944ce6.csv', 300000)
drink_kw = ['tuica','palinca','vin ','vinuri','whisky','vodka','rom ','gin ','lichior','bere',
            'sampanie','prosecco','cognac','coniac','rachiu','grappa','brandy','tequila','vermut',
            'aperitiv','bitter','absint','sake','soju','cidru','hidromel','must']
drink_exc = ['dulap','scaun','masa ','pat ','canapea','birou','raft','comoda','fotoliu','chiuveta',
             'baterie','robinet','cada','paravan','ceas de perete','panou','mese de','autofiletant',
             'sifon','arzator','corp inferior','corp superior','usa ','fereastra','jaluzea']
drinks = [p for p in tuica if any(k in p['title'].lower() for k in drink_kw)]
drinks = [p for p in drinks if not any(k in p['title'].lower() for k in drink_exc)]
drinks = [p for p in drinks if 15 < p['price'] < 2000]

food_picked = pick_curated(food, TARGET - min(150, len(drinks)))
drink_picked = pick_curated(drinks, min(150, TARGET - len(food_picked)))

for p in food_picked:
    all_products.append(to_seed(p, 'bagat_in_gura', 'vitamix.ro'))
for p in drink_picked:
    all_products.append(to_seed(p, 'bagat_in_gura', 'fabricadetuica.ro'))

print(f"  bagat_in_gura: {len(food_picked)} food + {len(drink_picked)} drinks = {len(food_picked)+len(drink_picked)}", file=sys.stderr)

# ==========================================
# 2. DE PURTAT — fashion
# ==========================================
print("Loading de_purtat...", file=sys.stderr)
fashion = read_feed('ffa1c7a34.csv')
fashion_exc = ['telefon','laptop','tableta','imprimanta','frigider','masina de spalat','aspirator']
fashion = [p for p in fashion if not any(k in p['title'].lower() for k in fashion_exc)]
fashion = [p for p in fashion if 10 < p['price'] < 5000]
fashion_picked = pick_curated(fashion, TARGET)
for p in fashion_picked:
    all_products.append(to_seed(p, 'de_purtat', 'originals.ro'))
print(f"  de_purtat: {len(fashion_picked)}", file=sys.stderr)

# ==========================================
# 3. DE CITIT — books
# ==========================================
print("Loading de_citit...", file=sys.stderr)
books = read_feed('f8ffadcf3.csv')
book_exc = ['insigna','magnet','puzzle ','poster','calendar','figurina','sticker','joc de','joc ',
            'pix ','stilou','caiet','agenda','penar','ghiozdan','mapa','etui','suport','rama foto',
            'cana ','ceaşcă','ceasca','farfurie','bol ','pahar']
books = [p for p in books if not any(k in p['title'].lower() for k in book_exc)]
books = [p for p in books if 10 < p['price'] < 300 and len(p['title']) > 10]
books_picked = pick_curated(books, TARGET, max_per_brand=10)  # more per publisher is ok
for p in books_picked:
    all_products.append(to_seed(p, 'de_citit', 'libris.ro'))
print(f"  de_citit: {len(books_picked)}", file=sys.stderr)

# ==========================================
# 4. PENTRU COPII — kids
# ==========================================
print("Loading pentru_copii...", file=sys.stderr)
ookee = read_feed('0a8bb918c.csv')
kids_kw = ['jucari','lego','puzzle','copii','educativ','trotineta','bicicleta','robot','disney',
           'paw patrol','plus ','papusa','masinuta','dinozaur','pokemon','barbie','hot wheels',
           'frozen','spider','avengers','minnie','mickey','nerf','playmobil','triciclu',
           'joc ','jocuri','cuburi','plastilina','desen','colorat','carte colorat',
           'peluche','plush','figurina','set creativ','nisip kinetic','tobogan','leagan',
           'casuta','cort copii','balansoar','patineta','role copii','skateboard',
           'masina cu telecomanda','elicopter','avion','tren','piesa lego']
kids_exc = ['poarta siguranta','extensie poarta','protectie priza','monitor bebe','sterilizator',
            'pompa san','biberon','suzeta','scutec','adult','18+','termometru medical']
kids = [p for p in ookee if any(k in p['title'].lower() for k in kids_kw)]
kids = [p for p in kids if not any(k in p['title'].lower() for k in kids_exc)]
kids = [p for p in kids if 10 < p['price'] < 2000]

# Also add from evomag (electronics toys)
evomag = read_feed('bd2f0ca9f.csv')
evomag_kids_kw = ['jucari','lego','drone','robot','educativ','copii','nintendo switch','consola jocuri']
evomag_kids = [p for p in evomag if any(k in p['title'].lower() for k in evomag_kids_kw)]
evomag_kids = [p for p in evomag_kids if 20 < p['price'] < 2000]

kids_picked = pick_curated(kids, TARGET - min(50, len(evomag_kids)))
evomag_picked = pick_curated(evomag_kids, min(50, TARGET - len(kids_picked)))

for p in kids_picked:
    all_products.append(to_seed(p, 'pentru_copii', 'ookee.ro'))
for p in evomag_picked:
    all_products.append(to_seed(p, 'pentru_copii', 'evomag.ro'))
print(f"  pentru_copii: {len(kids_picked)} + {len(evomag_picked)} evomag = {len(kids_picked)+len(evomag_picked)}", file=sys.stderr)

# ==========================================
# 5. 18+ — adult + beauty
# ==========================================
print("Loading 18plus...", file=sys.stderr)
adult = read_feed('689818a2f.csv')
adult = [p for p in adult if 10 < p['price'] < 2000]

esteto = read_feed('7680f01dc.csv')
beauty_kw = ['parfum','apa de parfum','apa de toaleta','set cadou','crema corp','body lotion',
             'ulei corp','gel dus','sapun natural','lumanare parfum','aromaterapie','balsam buze',
             'masca fata','ser facial','ulei esential','crema maini','crema antirid','deodorant',
             'after shave','colonie','eau de','crema de corp','lotiune corp','scrub corp',
             'spuma de baie','sare de baie','bomba de baie']
beauty_exc = ['profesional','salon','frizerie','coafor','paletar','semipermanent','gel uv','acril',
              'pensul','lampa uv','freza','pila electrica','sterilizator','aparat','masina de tuns',
              'foarfeca','pieptene','pelerina','guler tuns']
beauty = [p for p in esteto if any(k in p['title'].lower() for k in beauty_kw)]
beauty = [p for p in beauty if not any(k in p['title'].lower() for k in beauty_exc)]
beauty = [p for p in beauty if 15 < p['price'] < 2000]

adult_picked = pick_curated(adult, 200)
beauty_picked = pick_curated(beauty, TARGET - len(adult_picked))

for p in adult_picked:
    all_products.append(to_seed(p, '18plus', 'sexshop.ro'))
for p in beauty_picked:
    all_products.append(to_seed(p, '18plus', 'esteto.ro'))
print(f"  18plus: {len(adult_picked)} adult + {len(beauty_picked)} beauty = {len(adult_picked)+len(beauty_picked)}", file=sys.stderr)

# ==========================================
# 6. DE FACUT — activities from OSM
# ==========================================
print("Loading de_facut (OSM)...", file=sys.stderr)
with open('/tmp/osm-activities-parsed.json') as f:
    osm = json.load(f)

# Price estimation by type
price_ranges = {
    'museum': (15, 50), 'theatre': (40, 150), 'cinema': (25, 60),
    'gallery': (10, 40), 'arts_centre': (15, 50), 'escape_game': (100, 250),
    'zoo': (30, 80), 'theme_park': (50, 200), 'climbing': (50, 150),
    'water_park': (60, 200), 'bowling_alley': (30, 80), 'amusement_arcade': (20, 60),
    'paintball': (80, 200), 'karting': (50, 150), 'archery': (40, 100),
    'aquarium': (30, 70), 'miniature_golf': (20, 50), 'trampoline_park': (40, 100),
}

price_suffix = {
    'museum': 'lei/persoană', 'theatre': 'lei/bilet', 'cinema': 'lei/bilet',
    'gallery': 'lei/persoană', 'arts_centre': 'lei/persoană', 'escape_game': 'lei/grup',
    'zoo': 'lei/persoană', 'theme_park': 'lei/persoană', 'climbing': 'lei/sesiune',
    'water_park': 'lei/persoană', 'bowling_alley': 'lei/partidă', 'amusement_arcade': 'lei/oră',
    'paintball': 'lei/persoană', 'karting': 'lei/sesiune', 'archery': 'lei/sesiune',
    'aquarium': 'lei/persoană', 'miniature_golf': 'lei/partidă', 'trampoline_park': 'lei/oră',
}

type_images = {
    'museum': 'museum', 'theatre': 'theatre', 'cinema': 'cinema',
    'gallery': 'gallery', 'arts_centre': 'art', 'escape_game': 'escape',
    'zoo': 'zoo', 'theme_park': 'theme-park', 'climbing': 'climbing',
    'water_park': 'waterpark', 'bowling_alley': 'bowling', 'amusement_arcade': 'arcade',
    'paintball': 'paintball', 'karting': 'karting', 'archery': 'archery',
    'aquarium': 'aquarium', 'miniature_golf': 'minigolf', 'trampoline_park': 'trampoline',
}

# Shuffle for variety, then pick up to 500
random.shuffle(osm)
# Prioritize diverse types and cities
type_count = {}
city_count = {}
de_facut = []
for a in osm:
    t = a['type']
    c = a['city']
    # Limit museums to 200 (they dominate)
    if t == 'museum' and type_count.get(t, 0) >= 200: continue
    # Limit per city to 80
    if city_count.get(c, 0) >= 80: continue
    type_count[t] = type_count.get(t, 0) + 1
    city_count[c] = city_count.get(c, 0) + 1
    
    pr = price_ranges.get(t, (20, 80))
    price = random.randint(pr[0], pr[1])
    old_price = int(price * random.uniform(1.1, 1.4))
    
    entry = {
        "title": f"{a['label']} {a['name']}"[:120],
        "description": f"{a['desc']}. {a['city']}",
        "category": "de_facut",
        "priceCents": price * 100,
        "oldPriceCents": old_price * 100,
        "priceSuffix": price_suffix.get(t, 'lei/persoană'),
        "currency": "RON",
        "imageUrl": f"https://picsum.photos/seed/{type_images.get(t,'activity')}-{len(de_facut)}/600/400",
        "productUrl": a['website'] or f"https://www.google.com/maps/search/?api=1&query={a['lat']},{a['lon']}",
        "affiliateUrl": None,
        "sourceName": a['name'][:50],
        "sourceType": "map",
        "available": True,
        "rating": round(random.uniform(3.8, 4.9), 1),
        "tags": a['tags'] + [a['city'].lower().replace(' ','_')],
        "lat": a['lat'],
        "lon": a['lon'],
    }
    de_facut.append(entry)
    if len(de_facut) >= TARGET: break

all_products.extend(de_facut)
print(f"  de_facut: {len(de_facut)} (from OSM)", file=sys.stderr)

# ==========================================
# SUMMARY
# ==========================================
from collections import Counter
cats = Counter(p['category'] for p in all_products)
print(f"\n=== TOTAL: {len(all_products)} products ===", file=sys.stderr)
for k,v in sorted(cats.items()):
    has_aff = sum(1 for p in all_products if p['category']==k and p.get('affiliateUrl'))
    has_web = sum(1 for p in all_products if p['category']==k and p.get('productUrl'))
    print(f"  {k}: {v} ({has_aff} affiliate, {has_web} with website)", file=sys.stderr)

with open('data/seed-products.json', 'w') as f:
    json.dump(all_products, f, indent=2, ensure_ascii=False)
print("\nSaved to data/seed-products.json", file=sys.stderr)
