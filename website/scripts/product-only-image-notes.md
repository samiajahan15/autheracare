# Ordinary product-only images

Prepared with the built-in imagegen tool from the original supplied posters.

- `public/products/ordinary-nmf-product-only.webp`: Natural Moisturizing Factors + HA tube.
- `public/products/ordinary-hyaluronic-product-only.webp`: Hyaluronic Acid 2% + B5 bottle.
- `public/products/ordinary-eye-peptide-product-only.webp`: Multi-Peptide Eye Serum 15 mL bottle.
- The body lotion reuses the existing `public/products/body-lotion.png` cutout.

Each edit used this prompt, with its corresponding product name:

> Edit the reference poster into a clean ecommerce product cutout of [product]. Isolate ONLY the complete actual product, closed bottle or tube with its full cap, from the poster. Preserve precisely the existing packaging, brand logo, label wording, colors and proportions; do not invent details. Remove Authéra branding, poster text, decorative droplets, flowers, cream swirls, spare pipettes, retail boxes, props, surface, shadows and all scenery. Product upright, centered, fully visible with transparent margins on all sides. Genuinely transparent background, no glow or colored backdrop. One product only.

PNG masters remain beside the WebP delivery files. Sources remain unchanged.
Image mappings apply to the server catalog, product cards, detail pages, search
and cart through the shared product image resolver. The moisturizer's alternate
poster paths also map to its product-only image.

## Niacinamide, Rice Lipids and Mini Icons Set

Additional built-in imagegen edits are saved as:

- `public/products/ordinary-niacinamide-30-product-only.webp`
- `public/products/ordinary-rice-60-product-only.webp`
- `public/products/ordinary-rice-120-product-only.webp`
- `public/products/ordinary-mini-set-product-only.webp`

Prompt for each: Edit the supplied reference poster into a clean ecommerce
product-only photograph of the selected product. Preserve actual packaging,
brand logo, printed label wording, colors, proportions and contents exactly.
Show the entire selected product or set upright, all caps and bottoms intact,
centered with generous margins. Remove every poster heading, Authéra branding,
slogans, size callouts outside packaging, bubbles, splashes, plants, decorative
graphics, surrounding surface and scenery. Fully transparent background. No
glow, backdrop or added text. Do not invent packaging or label details.

The 60 mL edit selects the smaller right-hand Rice Lipids bottle, while the
120 mL edit selects the larger left-hand bottle. The Mini Icons edit retains
the retail box, three bottles, cotton pads and pouch as the actual set.
Primary and alternate Rice Lipids mappings now point directly to their final
variant assets. Regression tests check terminal mappings, file existence,
variant selection and transparent corners.

## Ordinary cleanser, MONDAY, Irish Spring, Glysomed and body creams

Built-in imagegen edits saved as PNG masters and transparent WebP assets:
- `public/products/ordinary-sulphate-240ml-product-only.webp` — single The Ordinary Sulphate 4% Cleanser for Body and Hair 240 mL bottle
- `public/products/monday-gentle-shampoo-354ml-product-only.webp` — ONLY the MONDAY Gentle SHAMPOO 354 mL pump bottle, not conditioner
- `public/products/monday-gentle-conditioner-354ml-product-only.webp` — ONLY the MONDAY Gentle CONDITIONER 354 mL pump bottle, not shampoo
- `public/products/irish-spring-soap-product-only.webp` — the single green Irish Spring soap bar and its retail carton only
- `public/products/glysomed-250ml-product-only.webp` — ONLY the larger Glysomed Hand Cream 250 mL tube with dark green bottom cap, not smaller tube
- `public/products/glysomed-50ml-product-only.webp` — ONLY the smaller Glysomed Hand Cream 50 mL tube with dark green bottom cap, not larger tube
- `public/products/bbw-vanilla-cafe-226g-product-only.webp` — single Bath & Body Works Vanilla Café Body Cream 226 g tube
- `public/products/bbw-whiskey-toast-226g-product-only.webp` — single Bath & Body Works Whiskey Toast Body Cream 226 g tube

Prompt template: Use case: background-extraction. Extract TARGET from this poster into clean ecommerce product-only photography. Preserve actual packaging, branding, printed product wording, colors, size and proportions exactly. Entire selected product fully visible from top through complete cap/pump and base, upright and centered with generous transparent margins. Remove ALL Authéra branding, headings, text outside packaging, benefit icons, leaves, towels, platforms, fruit, flowers, coffee, glassware, cream smears, splashes, droplets, scenery and background. Genuinely transparent background, no glow, no backdrop, no added or invented text.

## TIRTIR, Nizoral, Lubriderm, Aquaphor, Vichy, Kiehl’s and Nutrius

Built-in imagegen edits saved as PNG masters and transparent WebP assets:
- `public/products/tirtir-milk-toner-200ml-product-only.webp` — ONLY the leftmost TIRTIR Milk Skin Toner 200 mL bottle, omit the other two bottles
- `public/products/nizoral-shampoo-400ml-product-only.webp` — single Nizoral Anti-Dandruff Shampoo 2% Ketoconazole 400 mL bottle
- `public/products/lubriderm-lotion-710ml-product-only.webp` — single Lubriderm Daily Moisture Unscented Lotion 710 mL pump bottle
- `public/products/aquaphor-ointment-396g-product-only.webp` — single Aquaphor Healing Ointment 396 g jar with its actual navy lid, keep product and lid only
- `public/products/vichy-aqualia-15ml-product-only.webp` — single Vichy Aqualia Thermal Rich 15 mL cream jar, omit box
- `public/products/kiehls-cannabis-oil-30ml-product-only.webp` — single green Kiehl's Cannabis Sativa Seed Oil Herbal Concentrate 30 mL bottle with closed dropper cap; omit detached decorative dropper
- `public/products/nutrius-body-butter-177ml-product-only.webp` — the Nutrius Brazilian Body Butter Cream 177 mL actual jars; retain both variants shown together, remove scenery

Prompt template: Use case: background-extraction. Extract TARGET from the supplied poster into clean ecommerce product-only photography. Preserve exact packaging, brand logo, printed product wording, size, colors and proportions. Entire product upright and fully visible including lids, caps, pump and base, centered with generous transparent margins. Remove ALL Authéra branding, promotional text outside packaging, icons, hair, plants, flowers, fruit, cream smears, detached decorative droppers, platforms, scenery and background. Genuinely transparent background, no glow, no backdrop, no added or invented text.

Vichy's alternate poster maps to the same final jar image. Lubriderm retains the original bottle's printed 709 mL (24 fl oz), sold under the existing 710 mL listing.

## Maybelline and NYX product-only images

Built-in imagegen edits saved as PNG masters and transparent WebP assets:
- `public/products/maybelline-skin-tint-312-product-only.webp` — ONE Maybelline Super Stay 24H Skin Tint dropper bottle; use the central upright bottle packaging; omit other shades and do not invent a shade number
- `public/products/maybelline-teddy-baby-tee-product-only.webp` — ONE Maybelline Super Stay Teddy Tint closed lip tint bottle for Baby Tee; omit other bottles, applicator and teddy bear; do not invent a shade number
- `public/products/nyx-blur-golden-07-product-only.webp` — ONE NYX Bare With Me Blur 30 mL foundation tube for Golden 07; preserve tube packaging; omit hands and swatches; do not retain the pictured Vanilla 05 or Deep Mocha 24 shade labels, and do not invent shade text
- `public/products/nyx-cant-stop-pale-product-only.webp` — ONE NYX Can't Stop Won't Stop 30 mL foundation pump bottle, selecting the lightest pale bottle near the top center; omit every other bottle

Prompt template: Use case: background-extraction. Extract TARGET from the reference poster into clean ecommerce product-only photography. Preserve package shape, brand logo and product wording. Entire single product upright with complete cap/pump and base visible, centered with generous transparent margins. Remove all Authéra branding, promotional copy outside packaging, decorative objects, people, fruit, smears, drops, fabric and background. Genuinely transparent background, no glow, no backdrop, no added marketing text. Do not invent small unreadable label details.

The reference posters contain multiple shades and do not identify all requested shades. These isolated images illustrate packaging; no unsupported shade numbers were added. Lumi Matte replacement awaits the cropped listing's shade identification.

## La Roche-Posay product-only images

Built-in imagegen edits saved as PNG masters and transparent WebP assets:
- `public/products/lrp-micellar-foam-150ml-product-only.webp` — single blue La Roche-Posay Toleriane micellar foaming cleanser 150 mL pump bottle
- `public/products/lrp-anthelios-body-200ml-product-only.webp` — single Anthelios SPF 50+ hydrating body lotion 200 mL tube
- `public/products/lrp-anthelios-fluid-50ml-product-only.webp` — single Anthelios Ultra Fluid Invisible Finish SPF 50+ 50 mL bottle; omit retail box
- `public/products/lrp-anthelios-tinted-50ml-product-only.webp` — single Anthelios Mineral Tinted Ultra Fluid SPF 50 50 mL bottle; omit retail box
- `public/products/lrp-hyalu-b5-30ml-product-only.webp` — single blue Hyalu B5 serum 30 mL dropper bottle; omit retail box
- `public/products/lrp-cicaplast-b5-100ml-product-only.webp` — single Cicaplast Baume B5 100 mL tube; omit retail box

Prompt template: Use case: background-extraction. Extract only TARGET from this poster into clean ecommerce product-only photography. Preserve exact package, La Roche-Posay branding, printed formula wording, colors, size and proportions. Entire single product upright with complete cap/pump and base visible, centered with generous transparent margins. Remove all Authéra branding, promotional headings, text outside packaging, icons, boxes, leaves, platforms, water splashes and droplets, scenery and background. Genuinely transparent background, no glow, no added text or invented label details.

The cleanser alternate poster also maps directly to its final product-only asset.

## Cetaphil cream and L’Oréal mask and moisturizer

Built-in imagegen edits saved as PNG masters and transparent WebP assets:
- `public/products/cetaphil-body-cream-453g-product-only.webp` — only the single Cetaphil Moisturizing Cream 453 g jar with green lid
- `public/products/loreal-absolut-repair-mask-250ml-product-only.webp` — only the single L’Oréal Professionnel Absolut Repair 250 mL hair mask jar with black lid
- `public/products/loreal-men-vitalift-48ml-product-only.webp` — only the single L’Oréal Men Expert Vita Lift 48 mL moisturizer pump bottle, omit the retail box and all people

Prompt template: Use case: background-extraction. Extract TARGET from the supplied poster into clean ecommerce product-only photography. Preserve exact packaging, brand logo, printed wording, size, colors and proportions. Entire single product upright, fully visible including lid/pump and base, centered with generous transparent margins. Remove ALL Authéra branding, marketing headings, text outside packaging, icons, people, plants, cream, water splashes, platforms, scenery and background. Genuinely transparent background; no glow, no backdrop, no added or invented text.

## Cetaphil Restoraderm Baby, Scrub, Radiance Cleanser and Serum

Built-in imagegen edits saved as PNG masters and transparent WebP assets:
- `public/products/cetaphil-baby-restoraderm-295ml-product-only.webp` — single Cetaphil baby Restoraderm Soothing Moisturizer 295 mL pump bottle
- `public/products/cetaphil-extra-gentle-scrub-178ml-product-only.webp` — single Cetaphil Extra Gentle Daily Scrub 178 mL tube with blue cap
- `public/products/cetaphil-radiance-cleanser-product-only.webp` — single pink Cetaphil Healthy Radiance Gentle Renewing Cleanser tube
- `public/products/cetaphil-brightening-c-30ml-product-only.webp` — single Cetaphil Healthy Radiance Brightening-C Serum 30 mL dropper bottle, omit the box

Prompt template: Use case: background-extraction. Extract only TARGET from this poster into clean ecommerce product-only photography. Preserve real packaging, Cetaphil logo, printed wording, colors and proportions exactly. Complete single product upright, full cap/pump and base visible, centered with generous transparent margins. Remove all Authéra branding, promotional headings, benefits text outside packaging, faces, plants, towels, platforms, bubbles, scenery and background. Genuinely transparent background, no glow, no backdrop, no added or invented text.

## Ordinary Beta Glucan, PhytoCeramides, Caffeine and Alpha Arbutin

Built-in imagegen edits saved as PNG masters and transparent WebP assets:
- `public/products/ordinary-beta-glucan-30ml-product-only.webp` — only the single Natural Moisturizing Factors + Beta Glucan 30 mL tube
- `public/products/ordinary-phytoceramides-30ml-product-only.webp` — only ONE central Natural Moisturizing Factors + PhytoCeramides 30 mL tube, not all three tubes
- `public/products/ordinary-caffeine-30ml-product-only.webp` — only ONE upright Caffeine Solution 5% + EGCG 30 mL bottle, not the horizontal duplicate
- `public/products/ordinary-alpha-arbutin-30ml-product-only.webp` — only the Alpha Arbutin 2% + HA 30 mL bottle; omit the box

Prompt template: Use case: background-extraction. Extract TARGET from the supplied poster into a clean ecommerce product-only photograph. Preserve actual packaging, The Ordinary branding, printed formula wording, colors, proportions and size. Entire single product upright, fully visible including cap and base, centered with generous transparent margins. Remove ALL Authéra branding, promotional headings, text outside packaging, icons, platforms, cream smears, water splashes, droplets, scenery and background. Genuinely transparent background, no glow, no added or invented text.

## Ordinary sets and additional sizes

Built-in imagegen edits, with PNG masters beside the WebP files:
- `public/products/ordinary-acne-set-product-only.webp` — the Acne Set retail box and its three actual products: cleanser tube, salicylic acid bottle and moisturizer tube
- `public/products/ordinary-bright-set-product-only.webp` — the Bright Set retail box and its three actual bottles
- `public/products/ordinary-glycolic-100ml-product-only.webp` — ONLY the smaller right-hand 100 mL Glycolic Acid toner bottle, not the larger bottle
- `public/products/ordinary-glycolic-240ml-product-only.webp` — ONLY the larger left-hand 240 mL Glycolic Acid toner bottle, not the smaller bottle
- `public/products/ordinary-nmf-100ml-product-only.webp` — ONLY the larger left-hand 100 mL Natural Moisturizing Factors + HA tube, not the smaller 30 mL tube
- `public/products/ordinary-hyaluronic-ceramides-30ml-product-only.webp` — 30 mL Ceramides bottle

Prompt: Extract only the selected product or actual boxed set from the supplied poster into clean ecommerce product photography. Preserve packaging, branding, printed labels, colors, size and proportions. Entire product fully visible with caps and bases, upright and centered with transparent margins. Remove Authéra branding, promotional headings, benefits text outside packaging, icons, plants, platforms, water splashes, drops, scenery and background. Genuinely transparent background, no glow or added text. For toner sizes select the smaller right-hand 100 mL bottle or larger left-hand 240 mL bottle. For moisturizer select only the larger 100 mL tube. For Hyaluronic Acid retain the Ceramides label wording.

## Aveeno Kids Face & Body Gel Cream 227 mL

Built-in imagegen output: `public/products/aveeno-kids-gel-cream-227ml-product-only.webp` (PNG master beside it).

Prompt: Use case: background-extraction. Edit this poster into one ecommerce product-only cutout. Extract ONLY the Aveeno Kids Face & Body Gel Cream 227 mL tube with turquoise bottom cap. Preserve actual package shape, Aveeno Kids logo, seahorse artwork, orange and teal label text, size, colors and proportions. Show the complete tube upright from sealed top to complete cap, centered with generous transparent margins. Remove all Authéra branding, promotional text outside the tube, icons, oats, cloth, stone platform, shadows and background. Genuinely transparent background, no glow, no added text, no invented packaging.

## Aveeno product-only tubes

Built-in imagegen edits saved as PNG masters and transparent WebP assets:
- `public/products/aveeno-daily-lotion-71ml-product-only.webp`
- `public/products/aveeno-daily-lotion-227ml-product-only.webp`
- `public/products/aveeno-intense-relief-208ml-product-only.webp`

Prompt: Edit the supplied poster into one clean ecommerce product cutout. Extract only the selected tube (smaller right-hand 71 mL, larger left-hand 227 mL, or burgundy-label Intense Relief 208 mL). Preserve actual packaging, Aveeno branding, printed wording, size label, colors and proportions. Show the entire tube upright and centered with transparent margins. Remove all Authéra branding, poster headings, marketing text, icons, decorations, plants, oats, cloth, platform, shadows and background. Genuinely transparent background; no added text or invented labels.

## CeraVe Baby Moisturizing Cream 227 g

Saved to `public/products/cerave-baby-cream-227g-product-only.webp` with a PNG
master beside it. Prepared with the built-in imagegen tool using this prompt:

> Edit the supplied poster into ONE isolated ecommerce product photograph. Extract ONLY the CeraVe BABY Moisturizing Cream 227 g tube at the right of the three products, with the blue bottom cap. Do NOT include the two pump bottles. Preserve the tube's exact packaging shape, colors, CeraVe/BABY branding, printed wording and 227 g label. Entire tube upright and fully visible including sealed top and entire blue cap. Remove all poster branding, headings, promotional text, price strip, flowers, wood platform, cloth and scenery. Center the single complete tube with generous transparent margins on a genuinely transparent background. No added text, no backdrop, no glow. Do not invent details.
