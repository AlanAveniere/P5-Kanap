//permet d'afficher les différents produits avec une boucle en contactant l'api avec fetch
let hostname = '//localhost:3000';
function main() {
	fetch((hostname + `/api/products`))
		.then(response => response.json()
			.then((data) => {
				console.log(data);
				let html = '';
				data.forEach(function (item) {
					html += `<a href="product.html?id=${item._id}">
			<article>
				<img src="${item.imageUrl}" alt="${item.altTxt}">
					<h3 class="productName">${item.name}</h3>
					<p class="productDescription">${item.description}</p>
			</article>
		</a>`;
				}, this);

				document.getElementById('items').innerHTML = html;

			})
			//permet de retourner une error dans la console si une réponse provoque une exception
		).catch(err => console.log(err));
}
main();