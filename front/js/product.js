//récupérer les paramètres dans l'url
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const productId = urlParams.get('id');
let hostname = '//localhost:3000';

//Appel a l'API avec "id" en paramètre de function
let url = (hostname + `/api/products/${productId}`);

fetch(url)
	.then(response => response.json()
		.then((data) => {
			//Appel des options produits (qty/img/name/description)
			document.querySelector('.item__img').innerHTML = `<img src="${data.imageUrl}" alt="${data.altTxt}">`;
			document.getElementById('title').innerHTML = data.name;
			document.getElementById('price').innerHTML = data.price;
			document.getElementById('description').innerHTML = data.description;

			let colorsNode = document.getElementById('colors');
			for (let color of data.colors) {
				let addOption = document.createElement('option');
				addOption.text = color;
				addOption.value = color;
				colorsNode.add(addOption);
			}
		}).catch((err) => console.log(err))
	);

//Écoute les évènements sur la soumission du panier + enregistrement dans le localStorage
let button = document.querySelector('#addToCart');

function addToCart(id, color, qty) {
	let cart = {
		id: id,
		color: color,
		qty: qty,
	};

	let currentCart = JSON.parse(localStorage.getItem('products'));
	let isNewProduct = true;
	//Pour récupérer les quantitées
	if (currentCart && currentCart.length > 0) {
		for (let i of currentCart) {
			if (i.id === cart.id && i.color === cart.color) {
				i.qty = parseInt(i.qty) + parseInt(cart.qty);
				isNewProduct = false;
			}
		}
		if (isNewProduct) {
			currentCart.push(cart);
		}
		//loacalStorage -> stockage les données
		localStorage.setItem('products', JSON.stringify(currentCart)) //enregistre
	} else {
		let newCart = [];
		newCart.push(cart)
		localStorage.setItem('products', JSON.stringify(newCart))
	}
	window.alert('Produit ajouté au panier')
}
//Ajout au panier du choix client 
button.addEventListener('click', function () {
	let color = document.getElementById('colors');
	let qty = document.getElementById('quantity');
	addToCart(productId, color.options[color.selectedIndex].value, qty.value);
})