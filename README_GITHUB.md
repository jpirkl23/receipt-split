# Receipt Split 🧾

A production-quality web application for splitting receipts, invoices, and bills among groups with ease. Upload a receipt image, review the extracted items, assign them to group members, and get instant calculations of what each person owes.

## Features ✨

- **📸 Receipt Image Processing**: Upload receipt images (PNG, JPG, WebP) or take a photo with your camera
- **🔍 OCR Text Extraction**: Automatic extraction of items and prices using Tesseract.js
- **✏️ Manual Editing**: Adjust extracted items, quantities, prices, and subtotals for accuracy
- **👥 Group Management**: Define who's splitting the bill (minimum 2 people required)
- **🎯 Drag-and-Drop Assignment**: Intuitive drag-and-drop interface to assign items to group members
- **💰 Smart Calculations**: Automatic calculation of item splits, tax distribution, and tip allocation
- **⚙️ Tax & Tip Configuration**: Support for percentage-based or fixed amounts for tax and tip
- **📊 Results Summary**: Clear breakdown showing each person's pre-tax subtotal, tax share, tip share, and total
- **📥 CSV Export**: Export results to CSV for easy sharing and record-keeping
- **💾 Local Storage**: Auto-save your progress (metadata, items, people, assignments)
- **🔄 Reset Functionality**: One-click reset to start a new split or go back to the beginning

## Tech Stack 🛠️

- **Framework**: [Next.js 14](https://nextjs.org/) (React 18)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with persistence
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Drag-and-Drop**: [@dnd-kit](https://docs.dndkit.com/)
- **OCR Engine**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **Testing**: [Vitest](https://vitest.dev/) with React Testing Library
- **Build Tool**: [Vite](https://vitejs.dev/) (optimized with Next.js)
- **Language**: TypeScript

## Getting Started 🚀

### Prerequisites

- Node.js 18+ and npm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/receipt-split.git
cd receipt-split
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:3000`

## Usage Guide 📖

### Step 1: Add Receipt
- **Upload an Image**: Click or drag a receipt image onto the upload area
- **Take a Photo**: Use your device camera to capture the receipt
- **Load Demo**: Try with sample data to explore the app

### Step 2: Review Items
- Review extracted items, quantities, and prices
- **Edit** items directly in the table
- **Add** new items manually if missed by OCR
- **Delete** items you don't need
- Set the correct **Subtotal** (pre-filled from OCR)
- Configure **Tax** (percentage or fixed amount)
- Configure **Tip** (before tax, after tax, or fixed amount)
- **Optional**: Add event name and date for record-keeping

### Step 3: Assign Items
- See your group members on the left
- Drag items from the "Unassigned" area to assign them
- Split items by dragging individual units to multiple people
- View real-time calculations as you assign

### Step 4: View Results
- See the final breakdown for each person
- View subtotal, tax, tip, and total for everyone
- **Export to CSV** for sharing or accounting

## Project Structure 📁

```
src/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with header
│   ├── page.tsx                 # Main app with step navigation
│   ├── globals.css              # Global styles
│   └── pages/                   # Step components
│       ├── ReceiptUploadPage.tsx
│       ├── ReviewReceiptPage.tsx
│       ├── AssignItemsPage.tsx
│       └── ResultsPage.tsx
├── components/                  # Reusable React components
│   ├── Header.tsx              # Top navigation with reset
│   ├── ImageUpload.tsx         # Receipt upload & camera
│   ├── ReceiptReviewTable.tsx  # Item editing table
│   ├── Button.tsx              # Button component
│   ├── Input.tsx               # Input component
│   ├── Card.tsx                # Card layout
│   ├── DraggableItem.tsx       # Draggable item unit
│   ├── DroppableColumn.tsx     # Drop zone for items
│   ├── GroupSetup.tsx          # People management
│   ├── Configuration.tsx       # Tax & tip settings
│   ├── Results.tsx             # Results display
│   └── index.ts                # Component exports
├── lib/                        # Business logic & utilities
│   ├── ocr.ts                  # OCR processing & parsing
│   └── math.ts                 # Receipt calculations
├── store/                      # Zustand state management
│   └── index.ts               # Receipt store with persistence
├── types/                      # TypeScript type definitions
│   └── index.ts
└── __tests__/                  # Unit tests
    ├── math.test.ts
    ├── ocr.test.ts
    └── store.test.ts
```

## Available Scripts 📝

```bash
# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Run linter
npm run lint

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Key Features Explained 💡

### Smart OCR Processing
- Preprocesses images for better text recognition
- Parses extracted text to identify items, prices, and discounts
- Confidence scoring for each extracted item

### Flexible Expense Splitting
- Support splitting items between multiple people
- Each person's share is calculated based on drag-and-drop assignments
- Handles partial item quantities seamlessly

### Tax & Tip Distribution
- **Tax Options**: Percentage-based or fixed amount
- **Tip Options**: Before tax, after tax, or fixed amount
- Distributed proportionally based on each person's pre-tax subtotal

### Persistent State
- Auto-saves to browser's local storage (excludes large image data to prevent quota errors)
- Resumable workflow even after closing the browser
- One-click reset to clear all data

## Browser Support 🌐

- Modern browsers with support for:
  - ES2020+
  - Web APIs (Fetch, Media Streams, Local Storage)
  - Drag and Drop API
  - File API

## Known Limitations ⚠️

- Receipt images are not persisted to localStorage (to avoid quota exceeded errors)
- OCR accuracy depends on image quality and clarity
- Requires manual review and correction for best results

## Roadmap 🗺️

- [ ] Backend API for multi-device sync
- [ ] User authentication
- [ ] Cloud storage for receipt history
- [ ] Mobile app (React Native)
- [ ] Receipt history & saved receipts
- [ ] Email/SMS sharing of results
- [ ] Receipt templates for common vendors

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## Troubleshooting 🔧

### Storage Quota Exceeded Error
If you encounter a localStorage quota exceeded error:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `localStorage.clear()`
4. Refresh the page

### OCR Not Detecting Items
- Try a clearer, well-lit image
- Rotate the image so text is upright
- Manually add empty line items and edit values

### Camera Not Working
- Ensure you've granted camera permissions
- Use HTTPS in production (required for camera access)

## License 📄

This project is open source and available under the MIT License - see the LICENSE file for details.

## Support 💬

If you have questions or need help, please open an issue on GitHub or contact the maintainers.

---

**Made with ❤️ for easy bill splitting**
