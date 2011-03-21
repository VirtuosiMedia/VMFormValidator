VM Form Validator
===========

VM Form Validator is a JavaScript form validation script based on MooTools 1.3. It aims to provide simple, reliable validation for all form element types across all browsers in an unobtrusive manner. It is 100% styled by CSS and allows for custom validations and error messages. Error messages can be displayed above the form, above each input, or below each input. VMFormValidator should not be used as a replacement for server-side validation (using PHP, .NET, etc) because JavaScript can be disabled.
You can find a [full tutorial](http://www.virtuosimedia.com/dev/javascript/mootools-plugins/vm-form-validator/vm-form-validator-tutorial), the full [API docs](http://www.virtuosimedia.com/dev/javascript/mootools-plugins/vm-form-validator/vm-form-validator-api-documentation), and [demos](http://www.virtuosimedia.com/dev/javascript/mootools-plugins/vm-form-validator/vm-form-validator-demos) at the [Virtuosi Media website](http://www.virtuosimedia.com/).

![Screenshot](https://github.com/VirtuosiMedia/VMFormValidator/raw/master/vm-form-validator.png)

Features
----------

* Simple out of the box
* Unobtrusive - requires no changes to existing (X)HTML markup
* Degrades gracefully
* Cross browser - tested in Internet Explorer 7+, Firefox, Safari, Opera, and Chrome
* Validates every type of form element
* Customizable styling - 100% CSS styling. The label and form element both have error and success states and the error list can also be styled
* Customizable errors - each error can be customized with your error message text
* Customizable error positioning - errors can appear above each form element or below it
* Multiple validations per element - validations are fired in expected order in all browsers including Internet Explorer
* Display either one or multiple errors per element at a time
* Multiple forms can be validated per page
* Validates on blur and on submit with the option to turn either off
* Optional disabling of the submit button on error
* Intelligent cross-browser radio button validation - no false errors
* Includes the most common validations including required fields, email, password, url, dates-25 validations in total
* Custom regex validation - you can enter your own regex for the script to evaluate
* Custom functions - include custom functions to be run with onblur/onsubmit validation
* 19kb uncompressed, 9kb compressed

How to use
----------

Full documentation is available either on our website or in the package download. Basic usage is as follows:

	window.addEvent('domready', function(){
		var form = new VMFormValidator('registration');
		form.required('username', 'Please enter a username.'); //Custom error
		form.alphanumeric('username'); //Default error
		form.range('username', 4, 10) //Default error
		form.required('password', 'Please enter a password.'); //Custom error
		form.noMatches('password', 'username', 'The password and username cannot be the same.'); //Custom Error
		form.password('password'); //Default error
		form.required('confirmPassword'); //Default error
		form.matches('confirmPassword', 'password', 'Passwords must match.'); //Custom error
		form.required('email');	//Default error
		form.email('email'); //Default error			
	});