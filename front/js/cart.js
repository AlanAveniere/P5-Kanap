let cartItems = JSON.parse(localStorage.getItem('products'));
let cart = [];
let total = 0;
let qty = 0;
let html = '';
let hostname = '//localhost:3000';
let orderBtn = document.querySelector('#order');

//function => addEventListener(change) -- Diviser en trois fonction pour gérer les étapes
function updateCartQty(id, color, qty) {
// Quand on add/remove une qty
	let currentItem = {
		id: id,
		color: color,
		qty: qty
	};
	let cartItems = JSON.parse(localStorage.getItem('products'));

	////Boucle qui compare l'id  et la couleur pour vérifier que c'est le bon produit a qui on affecte le changement de qty
	if (cartItems && cartItems.length > 0) {
		for (let cartItem of cartItems) {
			if (cartItem.id === currentItem.id && cartItem.color === currentItem.color) {
				cartItem.qty = parseInt(currentItem.qty);
			}
		}

		localStorage.setItem('products', JSON.stringify(cartItems)); // enregistre les items
	}
	location.reload();
}

//Pour supprimer un item stocker dans le localStorage
function removeCartItem(id, color) {
	let cartItems = JSON.parse(localStorage.getItem('products'));
	for (let i = 0; i < cartItems.length; i++) {
		if (cartItems[i].id === id && cartItems[i].color === color) {
			document.querySelector('article.cart__item[data-id="' + cartItems[i].id + '"][data-color="' + cartItems[i].color + '"]').remove();
			cartItems.splice(i, 1);
			i--;
		}
	}
	localStorage.setItem('products', JSON.stringify(cartItems)); // enregistre les items
	location.reload();
}

//Pour mettre a jour le prix et la quantité total
function updateCartTotal() {
	let newQty = 0;
	let newTotal = 0;
	let cartItems = JSON.parse(localStorage.getItem('products'));

	for (let product of cartItems) { //Boucle pour recuperer la clr, donc voir cb le client en a prit
		if (product) {
			newTotal += parseInt(product.price) * parseInt(product.qty);
			newQty += parseInt(product.qty);
			document.getElementById('totalPrice').innerHTML = newTotal;
			document.getElementById('totalQuantity').innerHTML = newQty;
		}
	}
}


// Parcourir les options / ID stocker dans le localStorage
if (cartItems !== null) {
	for (let i = 0; i < cartItems.length; i++) {
		let product = cartItems[i];
		let id = cartItems[i].id;


		fetch(hostname + `/api/products/${id}`)
			.then(resp => {
				return resp.json();
			})
			.then(respJSon => {
				let productData = respJSon
				cart.push(id);
				html = `<article class="cart__item" data-id="${product.id}" data-color="${product.color}">
             <div class="cart__item__img">
               <img src="${productData.imageUrl}" alt="${productData.altTxt}">
             </div>
             <div class="cart__item__content">
               <div class="cart__item__content__description">
                 <h2>${productData.name}</h2>
                 <p>${product.color}</p>
                 <p>${productData.price}</p>
               </div>
               <div class="cart__item__content__settings">
                 <div class="cart__item__content__settings__quantity">
                   <p class="quantities">Qté : ${product.qty}</p>
                   <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${product.qty}">
                 </div>
                 <div class="cart__item__content__settings__delete">
                   <p class="deleteItem">Supprimer</p>
                 </div>
               </div>
             </div>
           </article>`;
				document.getElementById('cart__items').innerHTML += html;


				total += parseInt(productData.price) * parseInt(product.qty);
				qty += parseInt(product.qty);
				document.getElementById('totalPrice').innerHTML = total;
				document.getElementById('totalQuantity').innerHTML = qty;

				let qtyItems = document.getElementsByClassName('itemQuantity');
				for (let product of qtyItems) {
					product.addEventListener('input', function (e) {
                        console.log(product)
						let article = e.target.closest('article.cart__item');
						let color = article.dataset.color;
						let id = article.dataset.id;
						let qty = e.target.value;
						updateCartQty(id, color, qty);
						//e.target.previousElementSibling.innerHTML = "Qté : " + qty;
					})
				}

// addeventlistener pour gérer la suppression
				let removeItems = document.querySelectorAll('.deleteItem');
				for (let removeItem of removeItems) {
					removeItem.addEventListener('click', function (e) {
						e.preventDefault();
						let article = e.target.closest('article.cart__item');
						let id = article.dataset.id;
						let color = article.dataset.color;
						removeCartItem(id, color);
						updateCartTotal();
					});
				}
			}).catch((err) => console.log(err));
	}
}

let firstName = document.querySelector('#firstName');
let lastName = document.querySelector('#lastName');
let address = document.querySelector('#address');
let city = document.querySelector('#city');
let email = document.querySelector('#email');


orderBtn.addEventListener('click', function (e) {
	e.preventDefault();
	let errors = document.querySelectorAll('.error')
	for (const error of errors) {
		if (error.innerHTML.length){
			alert(`Une erreur a été rencontré lors de l'envoi du formulaire`);
			return
		}
	}

	// Formulaire client
let error = false;
console.log (validFirstName(firstName));
	if ( validFirstName(firstName) == false ){error = true};
lastName.addEventListener('change', function () {
	validLastName(this);
})
address.addEventListener('change', function () {
	validAdress(this);
})
city.addEventListener('change', function () {
	validCity(this);
})
email.addEventListener('change', function () {
	validEmail(this);
})

	let currentCart = JSON.parse(localStorage.getItem('products'));
	let idList = [];
	if (currentCart && currentCart.length > 0) {
		for (let i of currentCart) {
			idList.push(i.id);
		}
	}
	//récuprération des infos formulaire via la method post
	if (error == false){
	fetch(hostname + '/api/products/order', {
		method: 'post',
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ //Transforme les données js du form en chaine de caractère JSON
			contact: {
				firstName: firstName.value,
				lastName: lastName.value,
				address: address.value,
				city: city.value,
				email: email.value
			},
			products: idList
		})
	}).then(function (response) {
		//save le numero dans le local storage
		return response.json();
	}).then(respJSon => {
		if (respJSon.orderId) {
			localStorage.setItem('orderId', respJSon.orderId);
			//permet de se rendre sur la page confirmation
			window.location = 'confirmation.html'
		}
	}).catch((err) => console.log(err));
 }
});

// ***** Validation Prénom
const validFirstName = function (inputFirstName) {
	let firstNameRegExp = /[A-Za-z\s]+/;
	console.log(inputFirstName.value.match(firstNameRegExp));
	//On test l'expression régulière
	if (inputFirstName.value.match(firstNameRegExp) ){
		document.getElementById('firstNameErrorMsg').innerHTML = "";
		return inputFirstName.value.match(firstNameRegExp);
	} else {
		document.getElementById('firstNameErrorMsg').innerHTML = "Prénom invalide";
		return false;
	}
}
// ***** Validation Nom
const validLastName = function (inputLastName) {
	let nameRegExp = new RegExp(
		/^[A-Za-z\s]$/
	);
	//On test l'expression régulière
	if (nameRegExp.test(inputLastName.value)) {
		document.getElementById('lastNameErrorMsg').innerHTML = "";
	} else {
		document.getElementById('lastNameErrorMsg').innerHTML = "Nom invalide";
	}
}
// ***** Validation Adresse
const validAdress = function (inputAdress) {
	let adressRegExp = new RegExp(
		/^[A-Za-z0-9\s]$/gi
	);
	//On test l'expression régulière
	if (adressRegExp.test(inputAdress.value)) {
		document.getElementById('addressErrorMsg').innerHTML = "";
	} else {
		document.getElementById('addressErrorMsg').innerHTML = "Adresse invalide";
	}
}
// ***** Validation City
const validCity = function (inputCity) {
	let cityRegExp = new RegExp(
		/^[A-Za-z\s]$/
	);
	//On test l'expression régulière
	if (cityRegExp.test(inputCity.value)) {
		document.getElementById('cityErrorMsg').innerHTML = "";
	} else {
		document.getElementById('cityErrorMsg').innerHTML = "Lieu invalide ";
	}
};

// ***** Validation Email
const validEmail = function (inputEmail) {
	let emailRegExp = new RegExp(
		'^[a-zA-Z0-9.-_]+[@]{1}[a-zA-Z0-9.-_]+[.]{1}[a-z]{2,10}$', 'g'
	);
	//On test l'expression régulière
	if (emailRegExp.test(inputEmail.value)) {
		document.getElementById('emailErrorMsg').innerHTML = "";
	} else {
		document.getElementById('emailErrorMsg').innerHTML = "Email invalide";
	}
};
