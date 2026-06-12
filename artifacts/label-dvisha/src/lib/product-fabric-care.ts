/** Fixed product detail accordions (shown when showFabricCare is enabled). */
export type FixedProductDetailSection =
  | { id: string; title: string; type: "text"; content: string }
  | { id: string; title: string; type: "list"; items: readonly string[] };

export const FIXED_PRODUCT_DETAIL_SECTIONS: readonly FixedProductDetailSection[] = [
  {
    id: "fabric-details",
    title: "Fabric Details",
    type: "text",
    content: "100% Pure Linen",
  },
  {
    id: "wash-care",
    title: "Wash Care",
    type: "list",
    items: [
      "Dry clean only.",
      "Natural linen may experience slight shrinkage after the first wash.",
      "Avoid machine washing.",
      "Do not tumble dry.",
      "Dry in shade; avoid direct sunlight.",
      "Steam or warm iron when required.",
    ],
  },
  {
    id: "delivery",
    title: "Delivery Timeline",
    type: "text",
    content:
      "Standard orders ship within 7–10 business days. Custom or made-to-order pieces may take 14–21 days. Free shipping on orders over ₹5,000.",
  },
  {
    id: "customization",
    title: "Customization Options",
    type: "text",
    content:
      "Custom sizing is available on selected styles. Contact us for colour or embroidery modifications before you order.",
  },
  {
    id: "exchange",
    title: "Exchange Policy",
    type: "text",
    content:
      "Exchanges are accepted within 7 days of delivery for standard sizes, unworn and with tags attached. Custom pieces are final sale unless faulty.",
  },
];

export const FIXED_SECTION_IDS = FIXED_PRODUCT_DETAIL_SECTIONS.map((s) => s.id);
