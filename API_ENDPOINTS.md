# API Endpoints - NeoCoffee Webáruház

## Termékek (Products)

### `GET /api/products`
Összes termék listázása.

**Válasz:**
```json
[
  {
    "id": "a1b2c3d4",
    "nev": "Cappuccino",
    "ar": 850,
    "kep_url": "/images/cappuccino.jpg"
  }
]
```

### `GET /api/products/:id`
Egy termék lekérdezése.

**Válasz:**
```json
{
  "id": "a1b2c3d4",
  "nev": "Cappuccino",
  "ar": 850,
  "kep_url": "/images/cappuccino.jpg"
}
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
  "kep_url": "/images/cappuccino.jpg"
}
```

### `DELETE /api/products/:id`
Termék törlése (Admin).

**Válasz:**
```json
{
  "message": "Termék sikeresen törölve"
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
    "id": "abc12345",
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
        "id": "def67890",
        "rendeles_id": "abc12345",
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
Egy adott rendelés részletei (Admin).

**Válasz:**
```json
{
  "id": "abc12345",
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
      "id": "def67890",
      "rendeles_id": "abc12345",
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
  "id": "abc12345",
  "postazva": 1,
  "postazva_datum": "2026-01-14T14:20:00Z"
}
```

### `DELETE /api/orders/:id`
Rendelés törlése (Admin).

**Válasz:**
```json
{
  "message": "Rendelés sikeresen törölve"
}
```

### `POST /api/orders`
Új rendelés létrehozása (Publikus - vásárlók számára).

**Request:**
```json
{
  "vevo_nev": "Kovács János",
  "telefon": "+36 30 123 4567",
  "email": "kovacs.janos@example.com",
  "iranyitoszam": "1111",
  "telepules": "Budapest",
  "utca_hazszam": "Kossuth Lajos utca 12",
  "items": [
    {
      "termek_nev": "Cappuccino",
      "termek_ar": 850,
      "mennyiseg": 2,
      "tej": "Cow",
      "cukor": "1 spoon"
    }
  ]
}
```

**Válasz (201 Created):**
```json
{
  "id": "abc12345",
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
      "id": "def67890",
      "rendeles_id": "abc12345",
      "termek_nev": "Cappuccino",
      "termek_ar": 850,
      "mennyiseg": 2,
      "tej": "Cow",
      "cukor": "1 spoon"
    }
  ]
}
```

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
    "id": "a1b2c3d4",
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
    "id": "a1b2c3d4",
    "felhasznalonev": "admin"
  }
}
```