# API Endpoints - NeoCoffee Webáruház

## Termékek (Products)

### `GET /api/products`
Összes termék listázása.

**Válasz:**
```json
[
  {
    "id": 1,
    "nev": "Cappuccino",
    "ar": 850,
    "kep_url": null,
  }
]
```

### `GET /api/products/:id`
Egy termék listázása.

**Válasz:**
```json
[
  {
    "id": 1,
    "nev": "Cappuccino",
    "ar": 850,
    "kep_url": null,
  }
]
```

### `POST /api/products`
Új termék létrehozása (Admin).

**Request:**
```json
{
  "nev": "Ristretto",
  "ar": 950,
  "kep_url": null
}
```

### `PUT /api/products/:id`
Termék módosítása (Admin).

**Request:**
```json
{
  "nev": "Cappuccino",
  "ar": 900,
  "kep_url": null
}
```

## Rendelések (Orders)

### `GET /api/orders`
Összes rendelés listázása (Admin).

**Query paraméterek:**
- `postazva` (optional): `0` vagy `1` - szűrés postázási státusz szerint
- `email` (optional): szűrés email cím szerint

**Válasz:**
```json
[
  {
    "id": 1001,
    "vevo_nev": "Kovács János",
    "telefon": "+36 30 123 4567",
    "email": "kovacs.janos@example.com",
    "iranyitoszam": "1111",
    "telepules": "Budapest",
    "utca_hazszam": "Kossuth Lajos utca 12",
    "megrendelve": "2026-01-14T10:30:00Z",
    "postazva": 0,
    "postazva_datum": null,
    "items": [
      {
        "id": 1,
        "rendeles_id": 1001,
        "termek_nev": "Cappuccino",
        "termek_ar": 850,
        "mennyiseg": 2,
        "tej": "Cow",
        "cukor": "1 spoon"
      }
    ]
  }
]
```

### `GET /api/orders/:id`
Egy adott rendelés részletei (Admin vagy saját rendelés esetén email alapján).

**Válasz:**
```json
{
  "id": 1001,
  "vevo_nev": "Kovács János",
  "telefon": "+36 30 123 4567",
  "email": "kovacs.janos@example.com",
  "iranyitoszam": "1111",
  "telepules": "Budapest",
  "utca_hazszam": "Kossuth Lajos utca 12",
  "megrendelve": "2026-01-14T10:30:00Z",
  "postazva": 0,
  "postazva_datum": null,
  "items": [
    {
      "id": 1,
      "rendeles_id": 1001,
      "termek_nev": "Cappuccino",
      "termek_ar": 850,
      "mennyiseg": 2,
      "tej": "Cow",
      "cukor": "1 spoon"
    }
  ]
}
```

### `PATCH /api/orders/:id/ship`
Rendelés postázási státuszának módosítása (Admin).

**Request:**
```json
{
  "postazva": 1
}
```

**Válasz:**
```json
{
  "id": 1001,
  "postazva": 1,
  "postazva_datum": "2026-01-14T14:20:00Z"
}
```

### `DELETE /api/orders/:id`
Rendelés törlése (Admin).

---

## Admin Autentikáció

### `POST /api/admin/login`
Admin bejelentkezés.

**Request:**
```json
{
  "felhasznalonev": "admin",
  "jelszo": "Minad123!"
}
```

**Válasz:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "felhasznalonev": "admin",
    "letrehozva": "2026-01-14T10:00:00Z"
  }
}
```

### `POST /api/admin/logout`
Admin kijelentkezés.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### `GET /api/admin/verify`
Token ellenőrzés (Admin session validáció).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Válasz:**
```json
{
  "valid": true,
  "admin": {
    "id": 1,
    "felhasznalonev": "admin"
  }
}
```