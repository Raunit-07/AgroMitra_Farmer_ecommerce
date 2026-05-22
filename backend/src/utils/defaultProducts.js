const CATEGORY_IMAGE_COLORS = {
  seeds: ["ecfdf5", "166534"],
  pesticides: ["eff6ff", "1d4ed8"],
  insecticides: ["fff7ed", "c2410c"],
  "farming-tools": ["f8fafc", "334155"],
};

const CATEGORY_LABELS = {
  seeds: "Seeds",
  pesticides: "Pesticide",
  insecticides: "Insecticide",
  "farming-tools": "Farm Tool",
};

const PRODUCT_IMAGE_META = {
  "Hybrid Tomato Seeds": ["#fee2e2", "#dc2626", "tomato seed"],
  "Premium Wheat Seeds": ["#fef3c7", "#b45309", "wheat seed"],
  "Basmati Paddy Seeds": ["#ecfccb", "#4d7c0f", "paddy seed"],
  "Okra Seeds": ["#dcfce7", "#15803d", "okra seed"],
  "Mustard Seeds": ["#fef9c3", "#ca8a04", "mustard seed"],
  "Maize Seeds": ["#fef3c7", "#d97706", "maize seed"],
  "Coriander Seeds": ["#ecfdf5", "#047857", "coriander seed"],
  "Spinach Seeds": ["#dcfce7", "#166534", "spinach seed"],
  "Bottle Gourd Seeds": ["#e0f2fe", "#0f766e", "bottle gourd seed"],
  "Chilli Seeds": ["#fee2e2", "#b91c1c", "chilli seed"],
  "Neem Pest Control": ["#ecfdf5", "#15803d", "neem pest control"],
  "Fungal Shield Spray": ["#eff6ff", "#2563eb", "fungal shield spray"],
  "Crop Guard Pesticide": ["#f0fdf4", "#16a34a", "crop guard pesticide"],
  "Organic Pest Repellent": ["#f7fee7", "#65a30d", "organic pest repellent"],
  "Fruit Crop Protector": ["#fff7ed", "#ea580c", "fruit crop protector"],
  "Vegetable Pest Spray": ["#ecfdf5", "#059669", "vegetable pest spray"],
  "Soil Pest Treatment": ["#f5f5f4", "#78716c", "soil pest treatment"],
  "Bio Pesticide Concentrate": ["#e0f2fe", "#0284c7", "bio pesticide concentrate"],
  "Leaf Protection Spray": ["#dcfce7", "#16a34a", "leaf protection spray"],
  "Grain Crop Pest Control": ["#fef3c7", "#b45309", "grain pest control"],
  "Aphid Control Insecticide": ["#fef2f2", "#dc2626", "aphid control"],
  "Whitefly Guard": ["#f8fafc", "#475569", "whitefly guard"],
  "Borer Control Formula": ["#fff7ed", "#c2410c", "borer control"],
  "Termite Treatment": ["#f5f5f4", "#57534e", "termite treatment"],
  "Caterpillar Control": ["#ecfdf5", "#047857", "caterpillar control"],
  "Mealybug Remover": ["#fdf2f8", "#be185d", "mealybug remover"],
  "Thrips Protection Spray": ["#eef2ff", "#4f46e5", "thrips protection"],
  "Plant Mite Control": ["#fffbeb", "#d97706", "plant mite control"],
  "Sucking Pest Insecticide": ["#fef2f2", "#b91c1c", "sucking pest insecticide"],
  "Bio Insect Guard": ["#ecfeff", "#0891b2", "bio insect guard"],
  "Hand Trowel": ["#f8fafc", "#475569", "hand trowel"],
  "Garden Hoe": ["#f0fdf4", "#166534", "garden hoe"],
  "Pruning Shears": ["#eff6ff", "#1d4ed8", "pruning shears"],
  "Watering Can": ["#e0f2fe", "#0284c7", "watering can"],
  "Sprayer Pump": ["#ecfdf5", "#059669", "sprayer pump"],
  "Sickle": ["#fef3c7", "#92400e", "sickle"],
  "Seedling Tray": ["#dcfce7", "#15803d", "seedling tray"],
  "Soil Rake": ["#f5f5f4", "#57534e", "soil rake"],
  "Farm Gloves": ["#fff7ed", "#ea580c", "farm gloves"],
  "Mini Cultivator Tool": ["#f1f5f9", "#334155", "mini cultivator"],
};

const escapeSvg = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getProductImage = (name, category) => {
  const categoryColors = CATEGORY_IMAGE_COLORS[category] || ["f0fdf4", "166534"];
  const [bgRaw, colorRaw, visualLabelRaw] =
    PRODUCT_IMAGE_META[name] || [`#${categoryColors[0]}`, `#${categoryColors[1]}`, name];
  const bg = bgRaw.replace("#", "");
  const color = colorRaw.replace("#", "");
  const label = escapeSvg(name);
  const visualLabel = escapeSvg(visualLabelRaw);
  const categoryLabel = escapeSvg(CATEGORY_LABELS[category] || "Agro Product");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#${bg}"/>
      <rect x="52" y="48" width="696" height="504" rx="38" fill="#ffffff" opacity="0.62"/>
      <circle cx="400" cy="220" r="116" fill="#ffffff" opacity="0.9"/>
      <circle cx="400" cy="220" r="82" fill="#${color}" opacity="0.14"/>
      <path d="M400 132 C460 170 472 260 400 320 C328 260 340 170 400 132Z" fill="#${color}" opacity="0.84"/>
      <path d="M400 300 C445 258 505 270 555 322 C498 346 434 342 400 300Z" fill="#${color}" opacity="0.52"/>
      <path d="M400 300 C355 258 295 270 245 322 C302 346 366 342 400 300Z" fill="#${color}" opacity="0.52"/>
      <text x="400" y="228" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="#${color}">${visualLabel}</text>
      <text x="400" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#111827">${label}</text>
      <text x="400" y="462" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="600" fill="#${color}">${categoryLabel}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const CATALOG = {
  seeds: [
    ["Hybrid Tomato Seeds", 120, "High germination tomato seeds for kitchen and commercial farms."],
    ["Premium Wheat Seeds", 180, "Clean wheat seed variety suitable for seasonal sowing."],
    ["Basmati Paddy Seeds", 220, "Quality paddy seeds for aromatic rice cultivation."],
    ["Okra Seeds", 90, "Fast-growing okra seeds for fresh vegetable production."],
    ["Mustard Seeds", 110, "Healthy mustard seeds for oilseed farming."],
    ["Maize Seeds", 160, "Strong maize seed variety for reliable field performance."],
    ["Coriander Seeds", 75, "Aromatic coriander seeds for herb and spice cultivation."],
    ["Spinach Seeds", 65, "Leafy spinach seeds for quick harvest cycles."],
    ["Bottle Gourd Seeds", 95, "Selected bottle gourd seeds for home and farm gardens."],
    ["Chilli Seeds", 130, "Productive chilli seeds with strong plant vigor."],
  ],
  pesticides: [
    ["Neem Pest Control", 240, "Plant-based pest control for safer crop protection."],
    ["Fungal Shield Spray", 310, "Broad-spectrum protection against common crop fungus."],
    ["Crop Guard Pesticide", 280, "Effective pesticide for vegetable and grain crops."],
    ["Organic Pest Repellent", 260, "Eco-friendly repellent for routine crop care."],
    ["Fruit Crop Protector", 340, "Pest control formula for orchards and fruit crops."],
    ["Vegetable Pest Spray", 225, "Ready-to-use spray for vegetable pest management."],
    ["Soil Pest Treatment", 390, "Treatment for soil-borne pests before sowing."],
    ["Bio Pesticide Concentrate", 450, "Concentrated biological pesticide for farms."],
    ["Leaf Protection Spray", 210, "Helps protect leaves from biting and sucking pests."],
    ["Grain Crop Pest Control", 360, "Designed for wheat, paddy, and maize pest care."],
  ],
  insecticides: [
    ["Aphid Control Insecticide", 260, "Targets aphids and soft-bodied crop insects."],
    ["Whitefly Guard", 285, "Helps control whitefly infestation in vegetables."],
    ["Borer Control Formula", 420, "Insecticide for fruit and stem borer management."],
    ["Termite Treatment", 390, "Field treatment for termite protection."],
    ["Caterpillar Control", 330, "Controls caterpillars in leafy and fruiting crops."],
    ["Mealybug Remover", 300, "Useful for mealybug control in garden and farm crops."],
    ["Thrips Protection Spray", 315, "Helps manage thrips damage on flowers and vegetables."],
    ["Plant Mite Control", 350, "Controls mites and reduces leaf damage."],
    ["Sucking Pest Insecticide", 375, "Works against common sucking pests in crops."],
    ["Bio Insect Guard", 410, "Biological insect control for sustainable farming."],
  ],
  "farming-tools": [
    ["Hand Trowel", 140, "Durable hand trowel for planting and soil work."],
    ["Garden Hoe", 320, "Strong hoe for weeding and soil preparation."],
    ["Pruning Shears", 260, "Sharp shears for trimming plants and small branches."],
    ["Watering Can", 220, "Easy-pour watering can for gardens and nurseries."],
    ["Sprayer Pump", 680, "Manual sprayer pump for fertilizers and crop care."],
    ["Sickle", 190, "Traditional sickle for harvesting and cutting grass."],
    ["Seedling Tray", 150, "Reusable tray for nursery seedling preparation."],
    ["Soil Rake", 360, "Rake for leveling soil and removing debris."],
    ["Farm Gloves", 120, "Protective gloves for daily farm tasks."],
    ["Mini Cultivator Tool", 540, "Hand cultivator for loosening and aerating soil."],
  ],
};

export const DEFAULT_PRODUCT_CATEGORIES = Object.keys(CATALOG);

export const ensureDefaultProducts = async (Product) => {
  const created = [];

  for (const [category, items] of Object.entries(CATALOG)) {
    await Promise.all(
      items.map(([name]) => {
        const image = getProductImage(name, category);

        return Product.updateMany(
          {
            name,
            category,
            sellerId: "default-catalog",
          },
          {
            $set: {
              image,
              image_url: image,
            },
          }
        );
      })
    );

    const existingCount = await Product.countDocuments({ category });
    const missingItems = items.slice(existingCount);

    if (!missingItems.length) continue;

    const docs = missingItems.map(([name, price, description], index) => ({
      name,
      title: name,
      slug: `default-${category}-${existingCount + index + 1}`,
      description,
      price,
      image: getProductImage(name, category),
      image_url: getProductImage(name, category),
      category,
      category_id: category,
      unit: category === "farming-tools" ? "piece" : "kg",
      stock: 100,
      stock_quantity: 100,
      min_order_quantity: 1,
      sellerId: "default-catalog",
      is_active: true,
      is_approved: true,
    }));

    created.push(...(await Product.insertMany(docs)));
  }

  return created;
};
