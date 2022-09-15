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

// Parcourir les options / ID stocker dans le localStorage
function main() {
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
					});
				}
			}).catch((err) => console.log(err));
	}
}
}
main();

let firstName = document.querySelector('#firstName');
let lastName = document.querySelector('#lastName');
let address = document.querySelector('#address');
let city = document.querySelector('#city');
let email = document.querySelector('#email');


function order() {
	orderBtn.addEventListener('click', function (e) {
		e.preventDefault();
		let errors = document.querySelectorAll('.error')
		for (const error of errors) {
			if (error.innerHTML.length) {
				alert(`Une erreur a été rencontré lors de l'envoi du formulaire`);
				return
			}
		}

		// Formulaire client
		let error = false;
		console.log(validFirstName(firstName));
		if (validFirstName(firstName) == false) { error = true };
		console.log(validLastName(lastName));
		if (validLastName(lastName) == false) { error = true };
		console.log(validAdress(address));
		if (validAdress(address) == false) { error = true };
		console.log(validCity(city));
		if (validCity(city) == false) { error = true };
		console.log(validEmail(email));
		if (validEmail(email) == false) { error = true };

		let currentCart = JSON.parse(localStorage.getItem('products'));
		let idList = [];
		if (currentCart && currentCart.length > 0) {
			for (let i of currentCart) {
				idList.push(i.id);
			}
			//récuprération des infos formulaire via la method post
			if (error == false) {
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
						window.location = 'confirmation.html?commande=' + respJSon.orderId
					}
				}).catch((err) => console.log(err));
			}

		} else {
			window.alert('Votre panier est vide !')
		}
	});
}
order();

// ***** Validation Prénom
const validFirstName = function (inputFirstName) {
	let firstNameRegExp = /^[A-Za-z\sÀ-ù]{1,50}$/;
	//On test l'expression régulière
	if (firstNameRegExp.test(inputFirstName.value)) {
		document.getElementById('firstNameErrorMsg').innerHTML = "";
		return true;
	} else {
		document.getElementById('firstNameErrorMsg').innerHTML = "Prénom invalide";
		return false;
	}
}
// ***** Validation Nom
const validLastName = function (inputLastName) {
	let nameRegExp = /^[A-Za-z\sÀ-ù]{1,50}$/;
	//On test l'expression régulière
	if (nameRegExp.test(inputLastName.value)) {
		document.getElementById('lastNameErrorMsg').innerHTML = "";
		return true;
	} else {
		document.getElementById('lastNameErrorMsg').innerHTML = "Nom invalide";
		return false;
	}
}
// ***** Validation Adresse
const validAdress = function (inputAdress) {
	let adressRegExp = /^[A-Za-z0-9\sÀ-ù]{1,50}$/;
	//On test l'expression régulière
	if (adressRegExp.test(inputAdress.value)) {
		document.getElementById('addressErrorMsg').innerHTML = "";
		return true;
	} else {
		document.getElementById('addressErrorMsg').innerHTML = "Adresse invalide";
		return false;
	}
}
// ***** Validation City
const validCity = function (inputCity) {
	let cityRegExp = /^[A-Za-z\sÀ-ù]{1,50}$/;
	//On test l'expression régulière
	if (cityRegExp.test(inputCity.value)) {
		document.getElementById('cityErrorMsg').innerHTML = "";
		return true;
	} else {
		document.getElementById('cityErrorMsg').innerHTML = "Lieu invalide ";
		return false;
	}
};

// ***** Validation Email
const validEmail = function (inputEmail) {
	let emailRegExp = /^[a-zA-Z0-9.-_]+[@]{1}[a-zA-Z0-9.-_]+[.]{1}[a-z]{2,10}$/;
	//On test l'expression régulière
	if (emailRegExp.test(inputEmail.value)) {
		document.getElementById('emailErrorMsg').innerHTML = "";
		return true;
	} else {
		document.getElementById('emailErrorMsg').innerHTML = "Email invalide";
		return false;
	}
};
