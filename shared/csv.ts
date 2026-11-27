export type DelimitedTable = {
  headers: string[];
  rows: string[][];
  delimiter: ',' | '\t';
};

/** Parse RFC-4180 CSV or TSV text into headers and rows. */
export function parseDelimited(text: string, delimiter?: ',' | '\t'): DelimitedTable {
  const clean = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const firstLine = clean.split('\n', 1)[0] ?? '';
  const sep: ',' | '\t' =
    delimiter ?? (firstLine.includes('\t') && !firstLine.includes(',') ? '\t' : ',');

  if (!clean.trim()) return { headers: [], rows: [], delimiter: sep };

  const records: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"' && field.length === 0) {
      inQuotes = true;
    } else if (ch === sep) {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field);
      records.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    records.push(row);
  }

  // Drop trailing empty record caused by final newline
  while (records.length > 0 && records[records.length - 1].length === 1 && records[records.length - 1][0] === '') {
    records.pop();
  }

  if (records.length === 0) return { headers: [], rows: [], delimiter: sep };

  const [headers, ...rows] = records;
  const colCount = headers.length;
  const normalizedRows = rows.map((r) => {
    if (r.length === colCount) return r;
    if (r.length < colCount) return [...r, ...Array<string>(colCount - r.length).fill('')];
    return r.slice(0, colCount);
  });

  return { headers, rows: normalizedRows, delimiter: sep };
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function serializeCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((r) => r.map(escapeCsvCell).join(','));
  return lines.join('\n');
}
