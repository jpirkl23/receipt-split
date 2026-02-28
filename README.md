# Receipt Split 🧾

A production-quality MVP web application for splitting receipts among groups with accurate tax and tip calculation.

## Features

- 📸 **Receipt Ingestion**
  - Upload receipt images (PNG, JPG, WebP)
  - Take photos directly from your device camera
  - Automatic image preprocessing (grayscale, contrast enhancement)

- 🔍 **OCR & Parsing**
  - Client-side OCR using Tesseract.js
  - Automatic extraction of merchant name, date, items, prices
  - Intelligent detection of quantities, discounts, tax, and tip
  - Editable receipt review interface

- 👥 **Group Setup**
  - Add up to 12 people to your group
  - Custom naming for each person
  - Quick setup with preset group sizes (2-12)

- 🎯 **Drag & Drop Item Assignment**
  - Intuitive drag-and-drop interface
  - Assign items to individual people
  - Real-time subtotal calculations
  - Support for partial item splits

- 💰 **Tax & Tip Calculation**
  - Default 20% tip (configurable)
  - Multiple tip bases: pre-tax, post-tax, or fixed amount
  - Flexible tax configuration (percentage or fixed amount)
  - Automatic detection from receipt when available

- 📊 **Accurate Rounding**
  - Largest Remainder Method for fair distribution
  - Ensures sum of individual totals equals receipt total (within $0.01)
  - No rounding discrepancies

- 📤 **Export**
  - Copy results to clipboard
  - Download as CSV for spreadsheets
  - Detailed breakdown per person

- 💾 **Persistence**
  - Local state management with Zustand
  - LocalStorage persistence
  - Continue your session later

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Drag & Drop**: dnd-kit
- **OCR**: Tesseract.js (client-side)
- **Testing**: Vitest
- **Storage**: LocalStorage (no database required)

## Installation

### Prerequisites

- Node.js 18 or higher
- npm, yarn, pnpm, or bun

### Setup Steps

```bash
# Clone or download the project
cd receipt-split

# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
# Navigate to http://localhost:3000
```

## Usage

### Step 1: Add Receipt
- Click "Upload Image" to select a receipt photo
- Or use "Take Photo" to capture directly from camera
- Alternatively, load the demo receipt for testing

### Step 2: Review Items
- Verify extracted item names, quantities, and prices
- Edit any incorrect information
- Configure tax amount or percentage
- Delete items that shouldn't be split

### Step 3: Setup Group
- Click on preset group sizes (2-12 people)
- Or add people individually with custom names
- Rename people as needed

### Step 4: Assign Items
- Drag items from the unassigned column to each person
- Watch subtotals update automatically
- Configure tip percentage or fixed amount
- Choose tip basis (pre-tax, post-tax, or fixed)

### Step 5: Results
- View breakdown for each person
- See complete totals (subtotal, tax, tip, total)
- Copy results to clipboard
- Download as CSV

## How the Math Works

### Allocation Formula

For each person:

```
pretaxSubtotal = sum(assigned line items)

taxShare = (personPretax / totalPretax) * totalTax

tipShare = (personPretax / totalPretax) * totalTip

finalTotal = pretaxSubtotal + taxShare + tipShare
```

### Rounding Strategy

The app uses the **Largest Remainder Method** to distribute rounding remainders:

1. Calculate proportional shares with full precision
2. Floor each share to cents
3. Track remainders for each person
4. Distribute remaining pennies to people with largest remainders
5. Guarantees: sum(personTotals) == receiptTotal ± $0.01

### Tax Configuration

- **Percentage**: Applied to subtotal (configurable rate)
- **Fixed Amount**: Use receipt tax directly

### Tip Configuration

- **Pre-tax** (default): 20% of subtotal
- **Post-tax**: Tip calculated on subtotal + tax
- **Fixed Amount**: Override with custom dollar amount
- **Receipt Tip**: Use tip from receipt if detected

## Project Structure

```
receipt-split/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx              # Main page with navigation
│   │   ├── globals.css           # Global styles
│   │   └── pages/                # Step-specific pages
│   │       ├── ReceiptUploadPage.tsx
│   │       ├── ReviewReceiptPage.tsx
│   │       ├── GroupSetupPage.tsx
│   │       ├── AssignItemsPage.tsx
│   │       └── ResultsPage.tsx
│   ├── components/
│   │   ├── Button.tsx            # Button component
│   │   ├── Input.tsx             # Input component
│   │   ├── Card.tsx              # Card & Steps components
│   │   ├── ImageUpload.tsx       # File upload & camera
│   │   ├── ReceiptReviewTable.tsx # Item review table
│   │   ├── DraggableItem.tsx     # Draggable item component
│   │   ├── DroppableColumn.tsx   # Droppable column
│   │   ├── Results.tsx           # Results display components
│   │   ├── Configuration.tsx     # Tip & tax config
│   │   ├── GroupSetup.tsx        # Group setup interface
│   │   └── index.ts              # Component exports
│   ├── lib/
│   │   ├── math.ts               # Math engine & calculations
│   │   └── ocr.ts                # OCR & receipt parsing
│   ├── store/
│   │   └── index.ts              # Zustand store
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   └── test/
│       ├── setup.ts              # Test setup
│       ├── math.test.ts          # Math tests
│       └── ocr.test.ts           # OCR tests
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
├── vitest.config.ts
├── .eslintrc.json
└── README.md
```

## Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Testing
npm test

# Testing with UI
npm run test:ui

# Test coverage
npm run test:coverage
```

## Testing

The app includes comprehensive tests covering:

1. **Math Engine** (`math.test.ts`)
   - Rounding to cents
   - Tax calculation
   - Tip calculation
   - Proportional distribution
   - Largest Remainder Method
   - Edge cases and validation

2. **OCR & Parsing** (`ocr.test.ts`)
   - Receipt text parsing
   - Quantity extraction
   - Discount detection
   - Missing field handling
   - Mock demo receipt

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test math.test.ts

# Generate coverage report
npm run test:coverage
```

## Examples

### 2-Person Split
- Alice: $25 sandwich
- Bob: $25 sandwich
- Subtotal: $50, Tax: $5 (10%), Tip: $10 (20%)
- Each owes: 25 + 2.50 + 5 = **$32.50**

### 3-Person Uneven Split
- Alice: $20 (food)
- Bob: $15 (food)
- Charlie: $10 (drink)
- Subtotal: $45, Tax: $4.50, Tip: $9
- Total: $58.50
- Allocation by proportion:
  - Alice: 26 items → $20 + $1.74 + $3.48 = **$25.22**
  - Bob: 18 items → $15 + $1.30 + $2.61 = **$18.91**
  - Charlie: 6 items → $10 + $0.43 + $0.87 = **$11.30**
- Total: $25.22 + $18.91 + $11.30 = **$55.43** ✓

## Known Limitations & Future Improvements

### Current Limitations
- No authentication (local-only)
- No persistent database (localStorage only)
- OCR accuracy depends on receipt image quality
- Limited to 12 people per group
- No item splitting (items assigned in full to one person)

### Future Enhancements
- User accounts with history
- Cloud storage of splits
- Item splitting UI (e.g., "Bill pays 50% of this item")
- Receipt template library for popular restaurants
- Restaurant menu integration
- Multicard payment support
- QR code for sharing bills
- Tip calculator history
- Accessibility improvements

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Client-side OCR (no server latency)
- LocalStorage for instant persistence
- Optimized Tailwind CSS
- Next.js automatic code splitting
- Lazy loading of components

## Mobile Responsiveness

The app is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktops (1024px+)

## Troubleshooting

### OCR Not Working
- Ensure image is clear and well-lit
- Try adjusting contrast/color balance on the photo
- Use supported format (PNG, JPG, WebP)
- Check browser console for errors

### Data Not Persisting
- Clear browser cache and try again
- Check if LocalStorage is enabled
- Refresh the page to reload from storage

### Incorrect Calculations
- Verify receipt total in review step
- Check tax percentage is correct
- Ensure all items are assigned
- Review subtotal calculation

## Contributing

This is a production MVP. For improvements or bug reports, please create an issue or pull request.

## License

MIT

## Support

For issues or questions, refer to the code documentation and inline comments throughout the codebase.

---

**Receipt Split MVP** - Making bill splitting simple and fair. 💰✨
