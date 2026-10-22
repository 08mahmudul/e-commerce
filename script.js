/*
  DESHI DEALZ — WINTER STORE
  Before publishing:
  1) Replace demo products and prices below.
  2) Add your product photos under assets/products/ and update image paths.
  3) Set APPS_SCRIPT_URL and WHATSAPP_NUMBER.
  4) Add your real bKash/Nagad payment instructions in checkout messaging if needed.
*/
const STORE_CONFIG = {
  // Paste your deployed Google Apps Script Web App URL here.
  APPS_SCRIPT_URL: "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
  // Use country code + number, digits only. Example Bangladesh: 8801XXXXXXXXX
  WHATSAPP_NUMBER: "8801XXXXXXXXX",
  CURRENCY: "৳",
  DELIVERY_DHAKA: 90,
  DELIVERY_OUTSIDE: 110
};

// Demo products: replace these details with your real products.
const PRODUCTS = [
  {id:"hoodie-01",name:"Everyday Essential Hoodie",category:"Hoodies",price:890,oldPrice:1090,tag:"BESTSELLER",image:"assets/products/hoodie-01.jpg",colors:[{name:"Charcoal",hex:"#34383b"},{name:"Cream",hex:"#e8ddc9"},{name:"Olive",hex:"#69715a"}],sizes:["S","M","L","XL"],description:"A soft everyday hoodie."},
  {id:"sweater-01",name:"Soft Knit Sweater",category:"Sweaters",price:990,oldPrice:1190,tag:"NEW IN",image:"assets/products/sweater-01.jpg",colors:[{name:"Oatmeal",hex:"#cbb89e"},{name:"Black",hex:"#252525"}],sizes:["M","L","XL"],description:"A cosy knit for cooler days."},
  {id:"jacket-01",name:"Classic Utility Jacket",category:"Jackets",price:1490,oldPrice:1690,tag:"WINTER PICK",image:"assets/products/jacket-01.jpg",colors:[{name:"Black",hex:"#242424"},{name:"Sand",hex:"#b5a087"}],sizes:["M","L","XL"],description:"An easy layer for everyday wear."},
  {id:"hoodie-02",name:"Relaxed Fit Sweatshirt",category:"Hoodies",price:790,oldPrice:null,tag:"EASY LAYER",image:"assets/products/hoodie-02.jpg",colors:[{name:"Ash Grey",hex:"#9b9b96"},{name:"Navy",hex:"#263b51"}],sizes:["S","M","L","XL"],description:"A relaxed-fit winter staple."},
  {id:"sweater-02",name:"Ribbed Mock Neck",category:"Sweaters",price:1090,oldPrice:null,tag:"NEW IN",image:"assets/products/sweater-02.jpg",colors:[{name:"Brown",hex:"#7b5742"},{name:"Cream",hex:"#e8ddc9"}],sizes:["S","M","L"],description:"A polished cold-weather layer."},
  {id:"jacket-02",name:"Puffer Style Jacket",category:"Jackets",price:1890,oldPrice:2190,tag:"WINTER PICK",image:"assets/products/jacket-02.jpg",colors:[{name:"Black",hex:"#252525"},{name:"Olive",hex:"#69715a"}],sizes:["M","L","XL"],description:"A warm layer for chilly days."},
  {id:"hoodie-03",name:"Minimal Logo Hoodie",category:"Hoodies",price:950,oldPrice:null,tag:"EVERYDAY",image:"assets/products/hoodie-03.jpg",colors:[{name:"Navy",hex:"#263b51"},{name:"Cream",hex:"#e8ddc9"}],sizes:["S","M","L","XL"],description:"A simple hoodie with a clean look."},
  {id:"sweater-03",name:"Textured Crew Sweater",category:"Sweaters",price:1190,oldPrice:1390,tag:"LIMITED EDIT",image:"assets/products/sweater-03.jpg",colors:[{name:"Stone",hex:"#b5aa9b"},{name:"Forest",hex:"#43564a"}],sizes:["M","L","XL"],description:"A textured layer for everyday styling."}
];

const $ = (selector) => document.querySelector(selector);
const money = (amount) => STORE_CONFIG.CURRENCY + Number(amount).toLocaleString("en-BD");
let cart = [];
let activeCategory = "All";
let searchTerm = "";
let selectedProduct = null;

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function findProduct(id) { return PRODUCTS.find(p => p.id === id); }

function renderProducts() {
  const filtered = PRODUCTS.filter(p => (activeCategory === "All" || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(searchTerm) || p.category.toLowerCase().includes(searchTerm)));
  const grid = $("#productGrid");
  if (!filtered.length) {
    grid.innerHTML = '<p class="empty-results">No products found. Try another search.</p>';
    return;
  }
  grid.innerHTML = filtered.map(p => `
    <article class="product-card">
      <div class="product-image">
        <span class="product-tag">${escapeHTML(p.tag)}</span>
        <img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.hidden=false">
        <div class="image-fallback" hidden><b>DD</b><span>${escapeHTML(p.category)}</span></div>
        <button class="quick-add" data-add="${escapeHTML(p.id)}">Choose options +</button>
      </div>
      <div class="product-info">
        <span class="product-category">${escapeHTML(p.category)}</span>
        <h3 class="product-name">${escapeHTML(p.name)}</h3>
        <div class="product-bottom"><div class="product-price">${money(p.price)} ${p.oldPrice ? `<span class="old-price">${money(p.oldPrice)}</span>` : ""}</div>
          <div class="swatches" aria-label="Available colours">${p.colors.slice(0,4).map(c=>`<span class="swatch" title="${escapeHTML(c.name)}" style="background:${escapeHTML(c.hex)}"></span>`).join("")}</div>
        </div>
      </div>
    </article>`).join("");
}

function openProductOptions(productId) {
  const p = findProduct(productId);
  if (!p) return;
  selectedProduct = p;
  const optionsHTML = `
    <div class="drawer-head"><div><p class="eyebrow">${escapeHTML(p.category.toUpperCase())}</p><h2>${escapeHTML(p.name)}</h2></div><button class="close-button" id="closeOptions" aria-label="Close product options">×</button></div>
    <div class="options-body">
      <p class="option-price">${money(p.price)} ${p.oldPrice ? `<span class="old-price">${money(p.oldPrice)}</span>` : ""}</p>
      <p class="option-description">${escapeHTML(p.description)}</p>
      <label class="option-label">Choose colour<select id="optionColor">${p.colors.map(c=>`<option value="${escapeHTML(c.name)}">${escapeHTML(c.name)}</option>`).join("")}</select></label>
      <label class="option-label">Choose size<select id="optionSize">${p.sizes.map(s=>`<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`).join("")}</select></label>
      <label class="option-label">Quantity<input id="optionQty" type="number" min="1" max="10" value="1"></label>
      <button class="button button-dark full-width" id="addSelected">Add to bag <span>→</span></button>
    </div>`;
  const drawer = $("#cartDrawer");
  drawer.innerHTML = optionsHTML;
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden","false");
  $("#overlay").classList.add("open");
  document.body.style.overflow = "hidden";
  $("#closeOptions").addEventListener("click", closeCart);
  $("#addSelected").addEventListener("click", () => {
    const size = $("#optionSize").value;
    const color = $("#optionColor").value;
    const qty = Math.min(10, Math.max(1, Number($("#optionQty").value) || 1));
    const key = `${p.id}|${size}|${color}`;
    const existing = cart.find(i=>i.key===key);
    if (existing) existing.qty = Math.min(20,existing.qty+qty);
    else cart.push({key,id:p.id,size,color,qty});
    renderCart();
    closeCart();
    showToast("Added to your bag");
  });
}

function cartSubtotal() {
  return cart.reduce((sum,item)=>sum+findProduct(item.id).price*item.qty,0);
}
function currentDeliveryFee() {
  const area = $('select[name="area"]')?.value;
  if (area === "Dhaka") return STORE_CONFIG.DELIVERY_DHAKA;
  if (area === "Outside Dhaka") return STORE_CONFIG.DELIVERY_OUTSIDE;
  return null;
}
function renderCart() {
  const count = cart.reduce((n,i)=>n+i.qty,0);
  $("#cartCount").textContent = count;
  const drawerCount = $("#drawerCount"); if (drawerCount) drawerCount.textContent = `(${count})`;
  const itemsEl = $("#cartItems");
  if (!itemsEl) return; // options drawer is temporarily in use
  $("#cartEmpty").style.display = cart.length ? "none" : "flex";
  $("#cartSummary").style.display = cart.length ? "block" : "none";
  itemsEl.innerHTML = cart.map(item => {
    const p = findProduct(item.id);
    return `<div class="cart-line"><div class="cart-thumb"><img src="${escapeHTML(p.image)}" alt="" onerror="this.style.display='none';this.parentElement.textContent='DD'"></div>
      <div><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(item.color)} · Size ${escapeHTML(item.size)}</p><strong>${money(p.price*item.qty)}</strong>
      <div class="quantity-control"><button data-qty="${escapeHTML(item.key)}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button data-qty="${escapeHTML(item.key)}" data-delta="1" aria-label="Increase quantity">+</button></div>
      <button class="remove-item" data-remove="${escapeHTML(item.key)}">Remove</button></div></div>`;
  }).join("");
  $("#subtotal").textContent = money(cartSubtotal());
  const fee = currentDeliveryFee();
  $("#deliveryFee").textContent = fee === null ? "At checkout" : money(fee);
  $("#estimatedTotal").textContent = money(cartSubtotal()+(fee ?? 0));
  updateCheckoutTotal();
}
function restoreCartDrawer() {
  $("#cartDrawer").innerHTML = `
    <div class="drawer-head"><div><p class="eyebrow">YOUR SELECTION</p><h2>Your bag <span id="drawerCount">(0)</span></h2></div><button class="close-button" id="closeCart" aria-label="Close cart">×</button></div>
    <div class="cart-items" id="cartItems"></div>
    <div class="cart-empty" id="cartEmpty"><span>✳</span><h3>Your bag is waiting.</h3><p>Add a layer you love to get started.</p><button class="button button-dark" id="continueShopping">Continue shopping</button></div>
    <div class="cart-summary" id="cartSummary"><div><span>Subtotal</span><strong id="subtotal">৳0</strong></div><div><span>Delivery</span><strong id="deliveryFee">Calculated at checkout</strong></div><div class="total-row"><span>Estimated total</span><strong id="estimatedTotal">৳0</strong></div><button class="button button-dark full-width" id="checkoutButton">Continue to checkout <span>→</span></button><small>Delivery: ৳90 inside Dhaka · ৳110 outside Dhaka</small></div>`;
  $("#closeCart").addEventListener("click", closeCart);
  $("#continueShopping").addEventListener("click", closeCart);
  $("#checkoutButton").addEventListener("click", openCheckout);
  renderCart();
}
function openCart() {
  restoreCartDrawer();
  $("#cartDrawer").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden","false");
  $("#overlay").classList.add("open");
  document.body.style.overflow="hidden";
}
function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden","true");
  $("#overlay").classList.remove("open");
  document.body.style.overflow="";
  selectedProduct = null;
  setTimeout(restoreCartDrawer, 310);
}
function updateCheckoutTotal() {
  const fee = currentDeliveryFee();
  const total = cartSubtotal()+(fee ?? 0);
  const el=$("#checkoutTotal"); if(el) el.textContent=money(total);
}
function openCheckout() {
  if (!cart.length) return;
  closeCart();
  $("#checkoutModal").classList.add("open");
  $("#checkoutModal").setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  updateCheckoutTotal();
}
function closeCheckout() {
  $("#checkoutModal").classList.remove("open");
  $("#checkoutModal").setAttribute("aria-hidden","true");
  document.body.style.overflow="";
}
function showToast(message) {
  const t=$("#toast"); t.textContent=message; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2600);
}
function makeOrderPayload(formData) {
  const area=formData.get("area");
  const fee=area==="Dhaka"?STORE_CONFIG.DELIVERY_DHAKA:STORE_CONFIG.DELIVERY_OUTSIDE;
  const items=cart.map(item=>{
    const p=findProduct(item.id);
    return {productId:p.id,product:p.name,category:p.category,size:item.size,color:item.color,quantity:item.qty,unitPrice:p.price,lineTotal:p.price*item.qty};
  });
  return {
    orderId:"DD"+Date.now().toString().slice(-10),
    createdAt:new Date().toISOString(),
    customerName:String(formData.get("name")).trim(),
    phone:String(formData.get("phone")).trim(),
    address:String(formData.get("address")).trim(),
    district:String(formData.get("district")).trim(),
    deliveryArea:area,
    paymentMethod:String(formData.get("payment")),
    paymentReference:String(formData.get("paymentReference")||"").trim(),
    note:String(formData.get("note")||"").trim(),
    items:items,
    subtotal:cartSubtotal(),
    deliveryFee:fee,
    total:cartSubtotal()+fee,
    status:"New"
  };
}
function validateOrder(order) {
  const phone=order.phone.replace(/[\s()+-]/g,"");
  if(!/^\d{10,15}$/.test(phone)) return "Please enter a valid phone number (10–15 digits).";
  if(!order.items.length) return "Your bag is empty.";
  if(!order.customerName || !order.address || !order.district) return "Please complete all required fields.";
  return "";
}
async function submitOrder(order) {
  if (!STORE_CONFIG.APPS_SCRIPT_URL.startsWith("https://script.google.com/macros/s/")) {
    throw new Error("Google Sheets is not connected yet. Add the deployed Apps Script URL in script.js.");
  }
  // text/plain avoids a cross-origin JSON preflight. no-cors gives an opaque response,
  // so the storefront cannot verify server-side acceptance; check the Sheet after setup.
  await fetch(STORE_CONFIG.APPS_SCRIPT_URL,{
    method:"POST",
    mode:"no-cors",
    headers:{"Content-Type":"text/plain;charset=utf-8"},
    body:JSON.stringify(order)
  });
}
function orderWhatsAppText(order) {
  const lines=order.items.map(i=>`• ${i.product} | ${i.size} | ${i.color} × ${i.quantity} = ${money(i.lineTotal)}`).join("\n");
  return `Hi Deshi Dealz, I placed an order.\nOrder ID: ${order.orderId}\nName: ${order.customerName}\nPhone: ${order.phone}\nItems:\n${lines}\nSubtotal: ${money(order.subtotal)}\nDelivery: ${money(order.deliveryFee)}\nTotal: ${money(order.total)}\nPayment: ${order.paymentMethod}\nAddress: ${order.address}, ${order.district}`;
}

document.addEventListener("click",event=>{
  const add=event.target.closest("[data-add]");
  if(add) openProductOptions(add.dataset.add);
  const qty=event.target.closest("[data-qty]");
  if(qty){
    const item=cart.find(i=>i.key===qty.dataset.qty);
    if(item){item.qty+=Number(qty.dataset.delta);if(item.qty<=0)cart=cart.filter(i=>i.key!==item.key);if(item.qty>20)item.qty=20;renderCart();}
  }
  const remove=event.target.closest("[data-remove]");
  if(remove){cart=cart.filter(i=>i.key!==remove.dataset.remove);renderCart();}
});
document.querySelectorAll(".filter-chip").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter-chip").forEach(b=>b.classList.toggle("active",b===btn));
  activeCategory=btn.dataset.category;renderProducts();
}));
$("#searchInput").addEventListener("input",e=>{searchTerm=e.target.value.trim().toLowerCase();renderProducts();});
$("#searchToggle").addEventListener("click",()=>{$("#searchInput").focus();$("#searchInput").scrollIntoView({behavior:"smooth",block:"center"});});
$("#openCart").addEventListener("click",openCart);
$("#closeCart").addEventListener("click",closeCart);
$("#continueShopping").addEventListener("click",closeCart);
$("#checkoutButton").addEventListener("click",openCheckout);
$("#closeCheckout").addEventListener("click",closeCheckout);
$("#overlay").addEventListener("click",closeCart);
$("#checkoutModal").addEventListener("click",e=>{if(e.target===$("#checkoutModal"))closeCheckout();});
$('select[name="area"]').addEventListener("change",()=>{renderCart();updateCheckoutTotal();});
$('select[name="payment"]').addEventListener("change",e=>{$("#paymentReferenceLabel").hidden=e.target.value==="Cash on Delivery";});
$("#checkoutForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const status=$("#formStatus"),button=$("#placeOrderButton");
  status.className="form-status";status.textContent="";
  const order=makeOrderPayload(new FormData(e.currentTarget));
  const error=validateOrder(order);
  if(error){status.classList.add("error");status.textContent=error;return;}
  button.disabled=true;button.textContent="Submitting order…";
  try{
    await submitOrder(order);
    status.classList.add("success");
    status.textContent=`Order ${order.orderId} has been sent. Because the browser cannot verify the Sheets response, please contact us on WhatsApp to confirm your order.`;
    const wa=STORE_CONFIG.WHATSAPP_NUMBER;
    if(/^8801\d{9}$/.test(wa)){
      const link=`https://wa.me/${wa}?text=${encodeURIComponent(orderWhatsAppText(order))}`;
      const follow=document.createElement("a");follow.href=link;follow.target="_blank";follow.rel="noopener noreferrer";follow.className="button button-dark full-width";follow.style.marginTop="10px";follow.textContent="Confirm on WhatsApp";
      status.appendChild(document.createElement("br"));status.appendChild(follow);
    }
    cart=[];renderCart();e.currentTarget.reset();$("#paymentReferenceLabel").hidden=true;
    showToast("Order submitted — please confirm with the store");
  }catch(err){
    status.classList.add("error");
    status.textContent=err.message||"Could not submit the order. Please try again or contact us on WhatsApp.";
  }finally{button.disabled=false;button.innerHTML='Place order <span>→</span>';}
});
const waNumber=STORE_CONFIG.WHATSAPP_NUMBER;
$("#whatsappLink").href=/^8801\d{9}$/.test(waNumber)?`https://wa.me/${waNumber}`:"https://wa.me/";
$("#year").textContent=new Date().getFullYear();
renderProducts();renderCart();
