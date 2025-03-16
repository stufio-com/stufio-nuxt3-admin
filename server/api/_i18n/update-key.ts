import { promises as fs } from "fs";
import { resolve } from "path";
import { defineEventHandler, readBody } from "h3";

export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV !== "development") {
    return { success: false, error: "Development only" };
  }

  try {
    const body = await readBody(event);
    const { locale, key, value } = body;

    if (!locale || !key) {
      return { success: false, error: "Missing locale or key" };
    }

    // Get path to locale files
    const localesDir = resolve(process.cwd(), "locales");

    // Ensure directory exists
    try {
      await fs.access(localesDir);
    } catch (err) {
      await fs.mkdir(localesDir, { recursive: true });
    }

    const filePath = resolve(localesDir, `${locale}.json`);

    // Read existing translations
    let translations: Record<string, string> = {};
    try {
      const content = await fs.readFile(filePath, "utf8");
      translations = JSON.parse(content);
    } catch (err) {
      console.log(`Creating new locale file for ${locale}`);
    }

    // Add new key if it doesn't exist
    if (!translations[key]) {
      translations[key] =
        value !== undefined ? value : locale === "en" ? key : "";

      // Sort keys alphabetically for consistency
      const sortedTranslations = Object.fromEntries(
        Object.entries(translations).sort(([a], [b]) => a.localeCompare(b))
      );

      // Write back to file with pretty formatting
      await fs.writeFile(
        filePath,
        JSON.stringify(sortedTranslations, null, 2) + "\n",
        "utf8"
      );

      console.log(`Added key "${key}" to ${locale}.json`);
    }

    return { success: true, locale, key };
  } catch (err: any) {
    console.error("Error updating translations:", err);
    return { success: false, error: err.message };
  }
});