/**
 * Guards against mojibake. Windows PowerShell's Get-Content/Set-Content
 * round-trip mangles UTF-8 Cyrillic; this catches the damage immediately
 * instead of at review time.
 *
 * Signature: UTF-8 read as CP1251 sprays Serbian/Ukrainian/Macedonian
 * letters (Ђ, џ, ј, ў…) through the text. None of them
 * occur in Russian, so a single hit proves the file got double-encoded.
 */
import fs from "node:fs";
import path from "node:path";

// this file names the offending letters, so it has to exempt itself
const SKIP = /node_modules|\.next|[\\/]raw|[\\/]tools|[\\/]public|\.git|check-encoding/;
const SUSPECT =
  /[ЂЃЅІЈЉЊЋЌЎЏђѕіјљњћќўџҐґ]|Ð[-¿]/;

const bad = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (SKIP.test(p)) continue;
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|css|mjs|md|json)$/.test(e.name)) {
      const s = fs.readFileSync(p, "utf8");
      const m = s.match(SUSPECT);
      if (m) {
        bad.push(
          `${p}  →  ${JSON.stringify(s.slice(Math.max(0, m.index - 24), m.index + 24))}`
        );
      }
    }
  }
};
walk(process.cwd());

if (bad.length) {
  console.error("MOJIBAKE detected in:\n" + bad.join("\n"));
  process.exit(1);
}
console.log("encoding clean");
