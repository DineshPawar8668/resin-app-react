# Feature: Per-Unit Customer Details on Add-to-Cart

**Status:** Implemented, not yet tested end-to-end in browser. See test scenarios shared in chat (not saved to a file) for the manual QA script.

## What it does
When a customer clicks "Add to Cart" (from anywhere), a modal opens asking for:
- Date
- Name (fixed label, separate field)
- Message/Description (fixed label, separate field)
- Up to 12 images

Each click = one "instance" (one unit, one set of details) — e.g. if the same product is added twice for two different recipients (self + brother), the cart still shows **one line item with qty 2**, but two separate detail-sets are stored against it. On the admin order page, each product row has a "View Details (N)" button showing all N instances (date, name, description, image gallery with download).

## Why this shape
`Cart` has a **unique index on `(productid, customerid)`** in resin-server — one row per product per customer. Rather than fight that, `instanceDetails` is an array field on the Cart row; `quantity` always equals `instanceDetails.length`. Every "Add to Cart" click either creates the row (first time) or appends one instance + increments qty (subsequent times), for the *same* product+customer.

`Order` has **no reference back to Cart** — it's built fresh at Razorpay-verify time from a `products: [{product_id, quantity}]` array the client sends. So `instanceDetails` had to be threaded through: Cart → Checkout page → `/payments/initiate` & `/payments/verify` payload → stored into `Order.productsRawInfo[i].instanceDetails` (since cart gets cleared after the order, Order needs its own permanent copy).

## Backend (resin-server)
- `src/models/cart.model.ts` — added `instanceDetails: [{date, description, images}]`.
- `src/models/order.model.ts` — `productsRawInfo` entries extended with `instanceDetails`.
- `src/middleware/upload.middleware.ts` — new `uploadCartInstanceImages` (multer, up to 12 images).
- `src/repositories/cart.repository.ts` — `createWithInstance`, `appendInstance`, `removeInstanceAt`.
- `src/services/cart.service.ts` / `src/controllers/cart.controller.ts` — `addToCart` now multipart (uploads to Cloudinary folder `cart-instance-details`), new `removeInstance` (delete by index; removes whole row if it's the last instance). Old direct `updateQuantity` endpoint removed (no longer makes sense with instance-based qty).
- `src/routes/cart.routes.ts` — `POST /cart` (multipart), `DELETE /cart/:id/instance/:index` (new), `DELETE /cart/:id` (unchanged, full remove).
- `src/services/payment.service.ts` — typed `products` param as `CheckoutProduct[]` including `instanceDetails`; storage already worked via existing `productsRawInfo: products` pass-through, no logic change needed there.

## Frontend (resin-client)
- `src/components/AddToCartDetailsModal.tsx` (new) — the shared modal. Date + Name + Message fields (Name/Message are separate MUI TextFields with fixed floating labels — not free text — so the labels can never be deleted), 12-slot image upload grid, client-side validation.
- **4 separate add-to-cart entry points, all wired to this modal:**
  1. `src/components/ProductCard.tsx` (used on Home)
  2. `src/pages/ProductDetail.tsx` — if qty > 1 selected, modal repeats N times ("Item 1 of 3", "Item 2 of 3"...) before finishing.
  3. `src/pages/Cart.tsx` — "+" opens modal for one more instance; "-" opens a picker dialog to choose which instance to remove (not just decrement).
  4. `src/pages/Products.tsx` — has its **own separate inline card** (doesn't reuse `components/ProductCard.tsx`), wired independently. **If a 5th add-to-cart entry point is ever added anywhere, it must be wired to this same modal too — easy to miss since there's no single shared product-card component.**
- `src/services/cartService.ts` — `addToCart` now sends `FormData` (multipart), new `removeInstance(itemId, index)`.
- `src/services/paymentService.ts` — `CheckoutProduct` type includes `instanceDetails`.
- `src/pages/Checkout.tsx` — includes each cart item's `instanceDetails` when building the payment payload.
- `src/store/slices/cartSlice.ts` — `addToCart` reducer now replaces the whole item (not just quantity); new `removeCartInstance` reducer.
- `src/types/index.ts` — `CartInstanceDetail` type; `CartItem.instanceDetails`.
- `src/services/orderService.ts` — `OrderProductRawInfo` type with `instanceDetails`.
- `src/pages/AdminOrderDetail.tsx` — "View Details (N)" per product row → dialog listing each instance (Name/Description parsed and bolded separately, date, image grid) → click a thumbnail to zoom → Download button in zoomed view (fetches as blob so it forces a real download, not just a new tab).

## Data format note
The Message/Description field is stored server-side as a single string: `"Name: <name>\nMessage: <message>"`. Admin-side parsing (`parseInstanceDescription` in `AdminOrderDetail.tsx`) regex-splits this back into Name/Description for display. If this format ever changes, update both the modal's `handleSubmit` (where it's constructed) and that parser (where it's read back).

## Known gaps / not yet done
- Not tested live in browser (dev server + Cloudinary + Razorpay test flow).
- No server-side validation forcing `date`/`images` to be non-empty (only client-side) — a direct API call could add an instance with no images.
- No migration for pre-existing Cart rows without `instanceDetails` — code treats missing field as empty array, should be fine, but wasn't tested against real legacy data.
