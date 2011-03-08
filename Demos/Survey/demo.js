window.addEvent('domready', function(){
	var form1 = new VMFormValidator('survey');
	form1.required('pizza', 'Please enter your favorite food');
	form1.includes('pizza', ['pizza', 'Pizza'], "Survey says: Your favorite food is pizza");
	form1.required("uploadPizza", "Please show us a picture of your favorite food");
	form1.imageFile("uploadPizza", "Hey, you cannot fool us! That is not an image!"); 
	form1.includes('uploadPizza', ['pizza', 'Pizza'], "That does not look like a picture of pizza.");
	form1.required('pizzaFrequency', 'How often could you eat pizza?');
	form1.required('likePizza', 'Hungry? Check this box and then you can eat.');
});