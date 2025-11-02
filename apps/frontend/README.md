# Nola Analytics Frontend

Modern, user-friendly analytics dashboard built with Next.js, React, and TailwindCSS for restaurant data analysis.

## 🎨 Design System

Based on Nola's brand colors:

- **Navy/Black**: `#0F1114` - Primary text
- **White**: `#FFFFFF` - Backgrounds
- **Bright Blue**: `#00A3FF` - Interactive elements & CTAs
- **Light Gray**: `#F9FAFB` - Section backgrounds
- **Medium Gray**: `#6B7280` - Secondary text

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- SSH tunnel to EC2 database running

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── analytics/
│   │   └── page.tsx          # Main analytics dashboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles with Nola colors
│
├── components/
│   ├── ui/                   # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   └── Icons.tsx
│   │
│   └── analytics/            # Analytics-specific components
│       ├── DataSourceCard.tsx
│       ├── TimeFrameSelector.tsx
│       └── MetricCard.tsx
```

## 🎯 Features

- ✅ Landing page with platform overview
- ✅ Analytics dashboard with data source cards
- ✅ Quick metrics with trends
- ✅ Time frame selector
- ✅ Search & category filters
- ✅ Responsive, mobile-friendly design
- ✅ Nola brand colors throughout

## 📊 Data Sources

The dashboard provides access to:

- **Sales**: 500k+ records, revenue, trends
- **Products**: 500 items, rankings
- **Customers**: 10k customers, loyalty
- **Stores**: 50 locations, comparisons
- **Delivery**: 200k deliveries, performance
- **Channels**: iFood, Rappi, in-store
- **Payments**: Payment methods analysis
- **Customizations**: Product add-ons

## 🔌 Next Steps

To integrate with backend:

1. Connect to Cube.js API endpoint
2. Implement query builder
3. Add visualization library (Recharts/Chart.js)
4. Build report creation interface

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Cube.js API](https://cube.dev/docs)
