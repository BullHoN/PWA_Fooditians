
//offine data
db.enablePersistence()
	.catch((err)=>{
		if(err.code == 'failed-precondition'){
			//mutiple tabs open
			console.log('multiple tabs');
		}else if(err.code == 'unimplemented'){
			//lack of browser support
			console.log('not supported');
		}
	})

//real time listener
db.collection('recipes').onSnapshot((snapshot)=>{
	//console.log(snapshot.docChanges());
	snapshot.docChanges().forEach((change)=>{
		// console.log(change.doc.data(),change.doc.id,change);
		if(change.type === 'added'){
			//add to dom
			renderRecipe(change.doc.data(),change.doc.id)
		}
		if(change.type === 'removed'){
			//remove from dom
			removeRecipe(change.doc.id);
		}
	})
})

//add new recipe 
const form = document.querySelector('form');

form.addEventListener('submit',(e)=>{
	e.preventDefault();

	const recipe = {
		title:form.title.value,
		ingredients:form.ingredients.value
	}

	db.collection('recipes').add(recipe)
		.catch((err)=>console.log(err));

	form.title.value = '';
	form.ingredients.value = ''; 

})

//delete a recipe

const recipeContainer = document.querySelector('.recipes');

recipeContainer.addEventListener('click',(e)=>{

	if(e.target.tagName === 'I'){
		const id = e.target.getAttribute('data-id');
		console.log(id,e.target);
		db.collection('recipes').doc(id).delete();
	}
})