# ZakatFlow 🕌

Aplikasi pencatatan dan kalkulator zakat personal dengan UI Glassmorphism, menggunakan Google Sheets sebagai database.

## Tech Stack

- **Frontend Framework**: SvelteKit 5
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Bits UI (Shadcn-like)
- **Icons**: Lucide Svelte
- **Language**: TypeScript

## Features

### Kalkulator Zakat

- 🍚 **Zakat Fitrah** - Kalkulasi zakat untuk Ramadan
- 🥇 **Zakat Emas/Perak** - Zakat atas harta emas dan perak
- 💵 **Zakat Penghasilan** - Zakat dari gaji atau penghasilan
- 🏪 **Zakat Perdagangan** - Zakat dari usaha perdagangan
- 🌾 **Zakat Pertanian** - Zakat dari hasil pertanian
- 🌴 **Zakat Kebun/Ikan** - Zakat dari hasil kebun dan perikanan

### Fitur Lainnya

- 📊 Dashboard dengan ringkasan statistik
- 📋 Riwayat pembayaran zakat
- 💰 Referensi harga (emas, perak, beras)
- 🎨 UI Glassmorphism yang modern
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 20+
- npm atau pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/username/zakatflow.git
cd zakatflow

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
zakatflow/
├── src/
│   ├── app.css              # Global styles
│   ├── app.html             # HTML template
│   ├── lib/
│   │   ├── components/ui/   # Reusable UI components
│   │   ├── utils/           # Utility functions
│   │   └── assets/          # Static assets
│   └── routes/              # Application routes
├── static/                  # Static files
├── tailwind.config.js       # Tailwind configuration
├── svelte.config.js         # SvelteKit configuration
└── package.json             # Dependencies
```

## Zakat Calculation Rules

### Zakat Fitrah
- Nisab: Per jiwa
- Kadar: 2,5 kg beras atau 3,5 liter beras

### Zakat Emas/Perak
- Nisab: 85 gram (emas) / 595 gram (perak)
- Kadar: 2,5%

### Zakat Penghasilan
- Nisab: Setara 85 gram emas/tahun
- Kadar: 2,5%

### Zakat Perdagangan
- Nisab: Setara 85 gram emas
- Kadar: 2,5%
- Formula: Modal + Kas + Piutang - Hutang

### Zakat Pertanian
- Nisab: 653 kg gabah (~520 kg beras)
- Kadar: 5% (irigasi) / 10% (tadah hujan)

### Zakat Kebun/Ikan
- Nisab: Setara 85 gram emas
- Kadar: 2,5%

## Development Roadmap

### Phase 1 ✅ (Completed)
- SvelteKit project setup
- Tailwind CSS configuration
- Glassmorphism design system
- Main layout (Navbar, Sidebar, Footer)
- Dashboard page
- Navigation between pages

### Phase 2 (Todo)
- Google Sheets API integration
- Zakat calculation logic
- API endpoints
- CRUD operations

### Phase 3 (Todo)
- Dockerfile
- Kubernetes manifests
- k3d deployment

### Phase 4 (Todo)
- End-to-end testing
- Production deployment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

**Paino** - DevOps/SRE

---

Made with ❤️ for Muslims worldwide