# Supabase Storage Setup - Vehicle Images

## 1. Storage Bucket erstellen

Gehe zu **Supabase Dashboard** → **Storage** → **New bucket**

- **Name:** `vehicle-images`
- **Public bucket:** ✅ Ja (für öffentliche Bild-URLs)
- **File size limit:** 10MB
- **Allowed MIME types:** `image/jpeg, image/png, image/webp`

## 2. Storage Policies einrichten

Unter **Storage** → **Policies** für den Bucket `vehicle-images`:

### Policy: Dealer kann eigene Bilder hochladen

```sql
CREATE POLICY "Dealers can upload vehicle images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vehicle-images'
  AND (
    -- Pfad muss mit vehicle_id beginnen, die dem Dealer gehört
    EXISTS (
      SELECT 1 FROM public.vehicles v
      JOIN public.dealers d ON v.dealer_id = d.id
      WHERE d.user_id = auth.uid()
      AND (storage.foldername(name))[1] = v.id::text
    )
  )
);
```

### Policy: Dealer kann eigene Bilder löschen

```sql
CREATE POLICY "Dealers can delete own vehicle images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'vehicle-images'
  AND EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.dealers d ON v.dealer_id = d.id
    WHERE d.user_id = auth.uid()
    AND (storage.foldername(name))[1] = v.id::text
  )
);
```

### Policy: Öffentlicher Lesezugriff

```sql
CREATE POLICY "Public read access for vehicle images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'vehicle-images');
```

## 3. vehicle_images Tabelle (falls nicht vorhanden)

```sql
CREATE TABLE IF NOT EXISTS public.vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_main BOOLEAN NOT NULL DEFAULT false
);

-- Index für schnelle Abfragen
CREATE INDEX idx_vehicle_images_vehicle_id ON public.vehicle_images(vehicle_id);

-- RLS aktivieren
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;

-- Dealer kann eigene Bilder sehen
CREATE POLICY "Dealers can view own vehicle images"
ON public.vehicle_images
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.dealers d ON v.dealer_id = d.id
    WHERE d.user_id = auth.uid()
    AND v.id = vehicle_images.vehicle_id
  )
);

-- Dealer kann eigene Bilder erstellen
CREATE POLICY "Dealers can insert own vehicle images"
ON public.vehicle_images
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.dealers d ON v.dealer_id = d.id
    WHERE d.user_id = auth.uid()
    AND v.id = vehicle_images.vehicle_id
  )
);

-- Dealer kann eigene Bilder aktualisieren
CREATE POLICY "Dealers can update own vehicle images"
ON public.vehicle_images
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.dealers d ON v.dealer_id = d.id
    WHERE d.user_id = auth.uid()
    AND v.id = vehicle_images.vehicle_id
  )
);

-- Dealer kann eigene Bilder löschen
CREATE POLICY "Dealers can delete own vehicle images"
ON public.vehicle_images
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.dealers d ON v.dealer_id = d.id
    WHERE d.user_id = auth.uid()
    AND v.id = vehicle_images.vehicle_id
  )
);

-- Öffentlicher Lesezugriff (für Website-Anzeige)
CREATE POLICY "Public can view vehicle images"
ON public.vehicle_images
FOR SELECT
TO anon
USING (true);
```

## Quick Setup via SQL Editor

Kopiere alles in den Supabase SQL Editor und führe es aus:

```sql
-- 1. Tabelle erstellen (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_main BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON public.vehicle_images(vehicle_id);

-- 2. RLS aktivieren
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;

-- 3. Policies erstellen (ignoriert Fehler wenn schon vorhanden)
DO $$
BEGIN
  -- Select policy für authenticated
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Dealers can view own vehicle images') THEN
    CREATE POLICY "Dealers can view own vehicle images" ON public.vehicle_images FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.vehicles v JOIN public.dealers d ON v.dealer_id = d.id WHERE d.user_id = auth.uid() AND v.id = vehicle_images.vehicle_id));
  END IF;
  
  -- Insert policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Dealers can insert own vehicle images') THEN
    CREATE POLICY "Dealers can insert own vehicle images" ON public.vehicle_images FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM public.vehicles v JOIN public.dealers d ON v.dealer_id = d.id WHERE d.user_id = auth.uid() AND v.id = vehicle_images.vehicle_id));
  END IF;
  
  -- Update policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Dealers can update own vehicle images') THEN
    CREATE POLICY "Dealers can update own vehicle images" ON public.vehicle_images FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.vehicles v JOIN public.dealers d ON v.dealer_id = d.id WHERE d.user_id = auth.uid() AND v.id = vehicle_images.vehicle_id));
  END IF;
  
  -- Delete policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Dealers can delete own vehicle images') THEN
    CREATE POLICY "Dealers can delete own vehicle images" ON public.vehicle_images FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.vehicles v JOIN public.dealers d ON v.dealer_id = d.id WHERE d.user_id = auth.uid() AND v.id = vehicle_images.vehicle_id));
  END IF;
  
  -- Public select
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view vehicle images') THEN
    CREATE POLICY "Public can view vehicle images" ON public.vehicle_images FOR SELECT TO anon USING (true);
  END IF;
END $$;
```
