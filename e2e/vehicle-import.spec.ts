import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";
import os from "os";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

test.describe("Vehicle CSV/Excel Import", () => {
  let supabase: ReturnType<typeof createClient>;
  let testUserId: string;
  let testDealerId: string;
  let testCsvPath: string;
  let testExcelPath: string;

  test.beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseKey);

    // Erstelle Test-CSV-Datei
    const csvContent = `Marke,Modell,Variante,Erstzulassung,Kilometerstand,Treibstoff,Getriebe,Leistung,Farbe,VIN,Einkaufspreis,Verkaufspreis,Beschreibung
VW,Golf,GTI,2020-05-15,45000,petrol,manual,180,Schwarz Metallic,WVWZZZ1KZBW123456,18000,24900,Gepflegter Golf GTI mit Vollausstattung
BMW,320d,Touring,2019-03-20,68000,diesel,automatic,140,Blau,WBA8E1108KK123456,22000,29500,BMW 3er Touring mit Panoramadach
Audi,A4,Avant,2021-08-10,32000,hybrid,automatic,150,Weiss,WAUZZZ8K8DA123456,28000,35900,Neuwertiger A4 Avant Plug-in Hybrid`;

    testCsvPath = path.join(os.tmpdir(), `test-vehicles-${Date.now()}.csv`);
    fs.writeFileSync(testCsvPath, csvContent);

    console.log(`Created test CSV at: ${testCsvPath}`);
  });

  test.beforeEach(async ({ page }) => {
    // Login als Test-User
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: "test@dealeros.ch",
      password: "testpassword123",
    });

    if (signInError || !authData.user) {
      throw new Error("Test user login failed");
    }

    testUserId = authData.user.id;

    // Hole Dealer-ID
    const { data: dealer } = await supabase
      .from("dealers")
      .select("id")
      .eq("user_id", testUserId)
      .single() as { data: { id: string } | null };

    if (!dealer) {
      throw new Error("Test dealer not found");
    }

    testDealerId = dealer.id;

    // Setze Session Cookie
    await page.goto("/login");
    await page.evaluate(
      ([session]) => {
        localStorage.setItem(
          "sb-" + window.location.hostname.split(".")[0] + "-auth-token",
          JSON.stringify(session)
        );
      },
      [authData.session]
    );
  });

  test.afterAll(async () => {
    // Cleanup: Lösche Test-Fahrzeuge
    if (testDealerId) {
      await supabase
        .from("vehicles")
        .delete()
        .eq("dealer_id", testDealerId)
        .like("vin", "W%123456");
    }

    // Lösche Test-Dateien
    if (testCsvPath && fs.existsSync(testCsvPath)) {
      fs.unlinkSync(testCsvPath);
    }
  });

  test("should navigate to import page", async ({ page }) => {
    await page.goto("/dashboard/vehicles");
    
    // Prüfe ob Import-Button existiert
    const importButton = page.locator('a[href="/dashboard/vehicles/import"]');
    await expect(importButton).toBeVisible();
    
    // Klicke auf Import-Button
    await importButton.click();
    
    // Prüfe ob auf Import-Seite
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/import/);
    await expect(page.locator("h1")).toContainText("Fahrzeuge importieren");
  });

  test("should upload and preview CSV file", async ({ page }) => {
    await page.goto("/dashboard/vehicles/import");

    // Upload CSV
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testCsvPath);

    // Warte auf Dateiname-Anzeige
    await expect(page.locator("text=/test-vehicles-.*\\.csv/")).toBeVisible();

    // Klicke auf "Weiter zur Vorschau"
    await page.locator("button", { hasText: "Weiter zur Vorschau" }).click();

    // Prüfe Vorschau
    await expect(page.locator("h3", { hasText: "Datenvorschau" })).toBeVisible();
    await expect(page.locator("text=/3 Zeilen gefunden/")).toBeVisible();
    
    // Prüfe ob Tabelle mit Daten angezeigt wird
    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("td", { hasText: "VW" })).toBeVisible();
    await expect(page.locator("td", { hasText: "BMW" })).toBeVisible();
    await expect(page.locator("td", { hasText: "Audi" })).toBeVisible();
  });

  test("should auto-map columns correctly", async ({ page }) => {
    await page.goto("/dashboard/vehicles/import");

    // Upload CSV
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testCsvPath);

    // Gehe zur Vorschau
    await page.locator("button", { hasText: "Weiter zur Vorschau" }).click();
    
    // Gehe zum Mapping
    await page.locator("button", { hasText: "Weiter zum Spalten-Mapping" }).click();

    // Prüfe ob Mapping-Seite geladen ist
    await expect(page.locator("h3", { hasText: "Spalten zuordnen" })).toBeVisible();

    // Prüfe ob Pflichtfelder automatisch gemappt wurden
    // Die Auto-Mapping-Funktion sollte die deutschen Spaltennamen erkennen
    await expect(
      page.locator("text=/Alle Pflichtfelder zugeordnet/")
    ).toBeVisible({ timeout: 5000 });
  });

  test("should validate required fields", async ({ page }) => {
    // Erstelle CSV mit fehlenden Pflichtfeldern
    const invalidCsvContent = `Marke,Modell
VW,Golf
BMW,320d`;

    const invalidCsvPath = path.join(os.tmpdir(), `test-invalid-${Date.now()}.csv`);
    fs.writeFileSync(invalidCsvPath, invalidCsvContent);

    await page.goto("/dashboard/vehicles/import");

    // Upload invalid CSV
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(invalidCsvPath);

    await page.locator("button", { hasText: "Weiter zur Vorschau" }).click();
    await page.locator("button", { hasText: "Weiter zum Spalten-Mapping" }).click();

    // Versuche zu validieren (sollte fehlschlagen)
    await page.locator("button", { hasText: /Validieren/ }).click();

    // Prüfe auf Fehlermeldung
    await expect(
      page.locator("text=/Validierungsfehler gefunden/")
    ).toBeVisible();

    // Cleanup
    fs.unlinkSync(invalidCsvPath);
  });

  test("should successfully import vehicles", async ({ page }) => {
    await page.goto("/dashboard/vehicles/import");

    // Upload CSV
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testCsvPath);

    // Durchlaufe alle Schritte
    await page.locator("button", { hasText: "Weiter zur Vorschau" }).click();
    await page.locator("button", { hasText: "Weiter zum Spalten-Mapping" }).click();
    
    // Warte bis Auto-Mapping fertig
    await expect(
      page.locator("text=/Alle Pflichtfelder zugeordnet/")
    ).toBeVisible({ timeout: 10000 });

    await page.locator("button", { hasText: "Validieren & Import vorbereiten" }).click();

    // Starte Import
    await page.locator("button", { hasText: "Import starten" }).click();

    // Warte auf Abschluss (kann etwas dauern)
    await expect(
      page.locator("h3", { hasText: "Import abgeschlossen" })
    ).toBeVisible({ timeout: 30000 });

    // Prüfe Erfolg
    await expect(page.locator("text=/Erfolgreich importiert/")).toBeVisible();
    await expect(page.locator("text=/3/")).toBeVisible(); // 3 Fahrzeuge

    // Gehe zur Fahrzeug-Liste
    await page.locator("button", { hasText: "Zu den Fahrzeugen" }).click();

    // Prüfe ob Fahrzeuge in der Liste sind
    await expect(page).toHaveURL(/\/dashboard\/vehicles$/);
    await expect(page.locator("td", { hasText: "Golf GTI" })).toBeVisible();
    await expect(page.locator("td", { hasText: "320d Touring" })).toBeVisible();
    await expect(page.locator("td", { hasText: "A4 Avant" })).toBeVisible();
  });

  test("should show progress during import", async ({ page }) => {
    // Erstelle größere CSV für sichtbaren Fortschritt
    let largeCsvContent = "Marke,Modell,Erstzulassung,Kilometerstand,Verkaufspreis\n";
    for (let i = 0; i < 25; i++) {
      largeCsvContent += `VW,Golf ${i},2020-01-${String(i + 1).padStart(2, "0")},50000,20000\n`;
    }

    const largeCsvPath = path.join(os.tmpdir(), `test-large-${Date.now()}.csv`);
    fs.writeFileSync(largeCsvPath, largeCsvContent);

    await page.goto("/dashboard/vehicles/import");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(largeCsvPath);

    await page.locator("button", { hasText: "Weiter zur Vorschau" }).click();
    await page.locator("button", { hasText: "Weiter zum Spalten-Mapping" }).click();
    
    await expect(
      page.locator("text=/Alle Pflichtfelder zugeordnet/")
    ).toBeVisible({ timeout: 10000 });

    await page.locator("button", { hasText: "Validieren & Import vorbereiten" }).click();
    await page.locator("button", { hasText: "Import starten" }).click();

    // Prüfe ob Fortschrittsbalken angezeigt wird
    await expect(page.locator("text=/Import läuft/")).toBeVisible();
    
    // Warte auf Abschluss
    await expect(
      page.locator("h3", { hasText: "Import abgeschlossen" })
    ).toBeVisible({ timeout: 60000 });

    // Cleanup
    fs.unlinkSync(largeCsvPath);
    
    // Lösche Test-Fahrzeuge
    await supabase
      .from("vehicles")
      .delete()
      .eq("dealer_id", testDealerId)
      .eq("make", "VW")
      .like("model", "Golf %");
  });

  test("should handle file type validation", async ({ page }) => {
    // Erstelle eine Nicht-CSV-Datei
    const txtPath = path.join(os.tmpdir(), `test-invalid.txt`);
    fs.writeFileSync(txtPath, "This is not a CSV file");

    await page.goto("/dashboard/vehicles/import");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(txtPath);

    // Prüfe auf Fehlermeldung
    await expect(
      page.locator("text=/Bitte wählen Sie eine CSV oder Excel-Datei aus/")
    ).toBeVisible();

    // Cleanup
    fs.unlinkSync(txtPath);
  });

  test("should allow resetting import", async ({ page }) => {
    await page.goto("/dashboard/vehicles/import");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testCsvPath);

    await page.locator("button", { hasText: "Weiter zur Vorschau" }).click();

    // Gehe zurück
    await page.locator("button", { hasText: "Zurück" }).click();

    // Prüfe ob wieder auf Upload-Seite
    await expect(page.locator("h3", { hasText: "Datei auswählen" })).toBeVisible();
  });
});
