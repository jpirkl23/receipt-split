import { Receipt, LineItem } from "@/types";

/**
 * Generates a unique ID
 */
export function generateId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parses receipt text into structured JSON
 */
export function parseReceiptText(text: string): Receipt {
  const lines = text.split("\n").map((line) => line.trim());

  // Try to extract merchant name (usually first non-empty line)
  let merchantName: string | undefined;
  if (lines.length > 0 && lines[0].length > 0) {
    merchantName = lines[0];
  }

  // Try to find date
  let date: string | undefined;
  const datePattern =
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/;
  for (const line of lines) {
    const match = line.match(datePattern);
    if (match) {
      date = match[0];
      break;
    }
  }

  // Price pattern: captures prices like 1.99, 10.50, etc.
  const pricePattern = /\d+\.\d{2}/g;

  // Parse line items
  const lineItems: LineItem[] = [];
  const excludePatterns = [
    /total/i,
    /subtotal/i,
    /tax/i,
    /tip/i,
    /change/i,
    /visa/i,
    /mastercard/i,
    /amex/i,
    /card/i,
    /payment/i,
    /cash/i,
    /balance/i,
    /thank you/i,
  ];

  let subtotal: number | undefined;
  let tax: number | undefined;
  let tip: number | undefined;
  let total: number | undefined;

  for (const line of lines) {
    // Skip empty lines
    if (!line.length) continue;

    // Check if this line should be excluded (header/footer)
    if (excludePatterns.some((pattern) => pattern.test(line))) {
      // Try to extract subtotal, tax, tip, total
      if (/subtotal/i.test(line)) {
        const match = line.match(pricePattern);
        if (match) subtotal = parseFloat(match[match.length - 1]);
      } else if (/^tax/i.test(line) || /sales tax/i.test(line)) {
        const match = line.match(pricePattern);
        if (match) tax = parseFloat(match[match.length - 1]);
      } else if (/^tip/i.test(line)) {
        const match = line.match(pricePattern);
        if (match) tip = parseFloat(match[match.length - 1]);
      } else if (/^total/i.test(line) || /^grand total/i.test(line)) {
        const match = line.match(pricePattern);
        if (match) total = parseFloat(match[match.length - 1]);
      }
      continue;
    }

    // Extract price from line
    const priceMatches = line.match(pricePattern);
    if (!priceMatches || priceMatches.length === 0) {
      continue;
    }

    // Get the last price (usually the line total)
    const linePrice = parseFloat(priceMatches[priceMatches.length - 1]);

    // Extract quantity if present (e.g., "2x", "2@", "2 x")
    const quantityMatch = line.match(/(\d+)\s*[x@]/i);
    const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;

    // Detect discount (negative values or DISC keyword)
    const isDiscount = linePrice < 0 || /disc|coupon|credit/i.test(line);

    // Calculate unit price
    const unitPrice = quantity > 0 ? linePrice / quantity : linePrice;

    // Extract item name (remove prices, quantities)
    let itemName = line
      .replace(pricePattern, "")
      .replace(/(\d+)\s*[x@]/i, "")
      .trim();

    // Clean up whitespace
    itemName = itemName.replace(/\s+/g, " ");

    if (itemName.length === 0) {
      itemName = `Item ${lineItems.length + 1}`;
    }

    lineItems.push({
      id: generateId(),
      rawText: line,
      name: itemName,
      quantity,
      unitPrice,
      lineTotal: linePrice,
      isDiscount,
      confidence: 0.8, // Default OCR confidence
    });
  }

  // If subtotal not found, calculate from items
  if (subtotal === undefined) {
    subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  }

  return {
    merchantName,
    date,
    currency: "USD",
    subtotal,
    tax,
    tip,
    total: total || subtotal + (tax || 0) + (tip || 0),
    lineItems,
  };
}

/**
 * Mock demo receipt for testing without OCR
 */
export function getMockDemoReceipt(): Receipt {
  return {
    merchantName: "Downtown Deli & Cafe",
    date: "2024-01-15",
    currency: "USD",
    subtotal: 45.75,
    tax: 4.58,
    tip: undefined,
    total: 50.33,
    lineItems: [
      {
        id: generateId(),
        rawText: "Grilled Chicken Sandwich",
        name: "Grilled Chicken Sandwich",
        quantity: 1,
        unitPrice: 12.99,
        lineTotal: 12.99,
        isDiscount: false,
        confidence: 0.95,
      },
      {
        id: generateId(),
        rawText: "2x Iced Latte",
        name: "Iced Latte",
        quantity: 2,
        unitPrice: 5.49,
        lineTotal: 10.98,
        isDiscount: false,
        confidence: 0.92,
      },
      {
        id: generateId(),
        rawText: "Caesar Salad",
        name: "Caesar Salad",
        quantity: 1,
        unitPrice: 11.99,
        lineTotal: 11.99,
        isDiscount: false,
        confidence: 0.94,
      },
      {
        id: generateId(),
        rawText: "Chocolate Chip Cookie",
        name: "Chocolate Chip Cookie",
        quantity: 1,
        unitPrice: 3.99,
        lineTotal: 3.99,
        isDiscount: false,
        confidence: 0.91,
      },
      {
        id: generateId(),
        rawText: "Spinach & Feta Wrap",
        name: "Spinach & Feta Wrap",
        quantity: 1,
        unitPrice: 9.99,
        lineTotal: 9.99,
        isDiscount: false,
        confidence: 0.93,
      },
      {
        id: generateId(),
        rawText: "Discount -2.00",
        name: "Spring Promo",
        quantity: 1,
        unitPrice: -2.0,
        lineTotal: -2.0,
        isDiscount: true,
        confidence: 0.85,
      },
    ],
  };
}

/**
 * Image preprocessing for OCR
 * Converts image to grayscale and increases contrast
 */
export async function preprocessImage(
  file: File | Blob
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Cannot get canvas context"));
          return;
        }

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert to grayscale and increase contrast
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Grayscale using luminosity method
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;

          // Increase contrast (simple linear adjustment)
          const contrast = 1.5;
          const adjusted = Math.max(0, Math.min(255, (gray - 128) * contrast + 128));

          data[i] = adjusted;
          data[i + 1] = adjusted;
          data[i + 2] = adjusted;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert canvas to blob for OCR
 */
export async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to convert canvas to blob"));
      }
    }, "image/png");
  });
}
