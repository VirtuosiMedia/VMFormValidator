window.addEvent('domready', function(){
	var form1 = new VMFormValidator('register');
    form1.required('username', 'You must enter a username');
	form1.minLength('username', 5);
	form1.required('email');
	form1.email('email');
	form1.required('password');
	form1.password('password');
	form1.noMatches('password', 'username');
	form1.required('confirmPassword');
	form1.matches('confirmPassword', 'password');		
});   