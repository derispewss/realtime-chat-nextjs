<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Project Knowledge

## Design System - Color Palette

Primary:
- main: #000000
- foreground: #FFFFFF

Secondary:
- main: #FFFFFF
- foreground: #000000

Accent:
- main: #000000
- foreground: #FFFFFF

Destructive:
- main: #000000
- foreground: #FFFFFF

## Rules
- Always use these colors (black & white only)
- Do not use any other colors
- Use grayscale if needed (e.g. gray-100 to gray-900)
- Prefer shadcn/ui variants

### Design System
- Gunakan komponen dari `/components/ui`
- Jangan pakai inline style
- Semua button harus pakai variant dari shadcn
- Anda bisa membuat components costum

## Coding Rules
- Always use arrow functions
- Do NOT use function declarations
- Use const for function definitions

## TypeScript Rules
- All interfaces must start with capital "I"
- Use PascalCase for interface names

### Naming Convention
- Gunakan camelCase untuk variable
- Gunakan PascalCase untuk component

<!-- END:nextjs-agent-rules -->
