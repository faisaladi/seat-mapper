# Interactive Seat Mapping & Grid Editor

> **Project Status**: 🟢 `Standalone Interactive Tool`  
> **Tech Stack**: Next.js, React, TypeScript, Tailwind CSS, PapaParse  
> **Architecture**: Client-side interactive 2D grid matrix editor with multi-mode state manipulation & CSV import/export

A fast, browser-based seat layout editor designed to construct, visualize, and label custom venue seating configurations.

---

## 🌟 Key Features

- **Dynamic Grid Dimensions**: Dynamically adjust venue grid rows and columns with live preview and re-indexing.
- **Drag-to-Paint Seat States**: Multi-select and bulk-paint seat statuses (`AVAILABLE`, `UNAVAILABLE`, `VOID`) using intuitive click-and-drag interactions.
- **Configurable Label Editing**: Dedicated modal editor for custom seat labeling and row numbering schemes with feature-flag toggling.
- **Live Inventory Breakdown**: Real-time KPI counter displaying total seats, available slots, and blocked capacities.
- **PapaParse CSV Pipeline**: Instant import and export capabilities compatible with ticketing platforms and venue spreadsheets.

---

## 🚀 Getting Started

```bash
# Clone repository
git clone https://github.com/faisaladi/seat-mapper.git
cd seat-mapper

# Install dependencies
npm install

# Start local development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the tool.

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.