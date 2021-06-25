const store = document.querySelector("#store");
const search = document.querySelector("#search");
search.addEventListener("submit", handleSearch);
buildStore(data);

function buildStore(items) {
  store.firstElementChild.innerHTML = "";
  items.forEach((item) => {
    const str = /* html */ `
        <div class="item" id="${item.name}">
            <picture>
                <img src="${item.img}" alt="${item.name}" />
            </picture>
            <div class="text">
                <div class="top">
                    <h5>${item.name}</h5>&bull;
                    <p>$${item.price.toLocaleString("es-AR")}</p>
                </div>
                <button>Comprar &rarr;</button>
            </div>
        </div>
    `;
    const fragment = document.createRange().createContextualFragment(str);
    const btn = fragment.querySelector("button");
    btn.addEventListener("click", handleBuy);

    store.firstElementChild.appendChild(fragment);
  });
}

async function handleSearch(event) {
  event.preventDefault();
  const res = await fetch(
    event.target.action + `?query=${event.target.query.value}`,
    {
      method: event.target.method,
      body: event.target.body,
    }
  )
    .then((blob) => blob.json())
    .catch((err) => console.log(err));

  buildStore(res);
}

let previousItem;
async function handleBuy(event) {
  const item = event.target.parentElement.parentElement;
  if (item === previousItem) return;

  const url = window.location.href.replace(window.location.hash, `#${item.id}`);

  setTimeout(() => {
    window.location.href = url;
  }, 100)

  cleanPreviousItem();
  item.appendChild(createForm(item));
  item.classList.add("open");

  previousItem = item;
}

function cleanPreviousItem() {
  if (!previousItem) return;
  previousItem.classList.remove("open");
  const form = previousItem.querySelector(".form");
  form.remove();
}

const str = /* html */ `
<div class="form">
      <form>
        <label>
            Nombre:
            <input name="firstName" disabled="true" type="text" value="Lalo" />
        </label>
        <label>
            Apellido:
            <input name="lastName" disabled="true" type="text" value="Landa" />
        </label>
        <label>
            Email:
            <input name="email" disabled="true" type="email" value="test_user_63274575@testuser.com" />
        </label>
        <label>
            Cod. Área:
            <input name="areaCode" disabled="true" type="text" value="11" />
        </label>
        <label>
            Teléfono:
            <input name="phone" disabled="true" type="text" value="22223333" />
        </label>
        <label>
            Calle:
            <input name="street" disabled="true" type="text" value="Falsa" />
        </label>
        <label>
            Nro:
            <input name="streetNumber" disabled="true" type="text" value="123" />
        </label>
        <label>
            Código Postal:
            <input name="zipCode" disabled="true" type="text" value="1111" />
        </label>
        <button type="submit">Continuar compra</button>
      </form>
      <div class="mp-button"></div>
</div>
`;

function createForm(item) {
  const fragment = document.createRange().createContextualFragment(str);
  const form = fragment.querySelector("form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const res = await fetch(`/api/item`, {
      method: "POST",
      body: JSON.stringify({
        item: item.id,
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        areaCode: form.areaCode.value,
        phone: form.phone.value,
        street: form.street.value,
        streetNumber: form.streetNumber.value,
        zipCode: form.zipCode.value,
      }),
    })
      .then((blob) => blob.json())
      .catch((err) => console.log(err));

    if (res) {
      renderMpButton(res.id);
    }
  });

  return fragment;
}

function renderMpButton(id) {
  const mp = new MercadoPago("TEST-c612f48c-81d3-4401-ae2d-28ef64c7cf9e", {
    locale: "es-AR",
  });
  // const mp = new MercadoPago("APP_USR-7eb0138a-189f-4bec-87d1-c0504ead5626", {
  //   locale: "es-AR",
  // });

  mp.checkout({
    preference: {
      id,
    },
    autoOpen: true,
  });
}
